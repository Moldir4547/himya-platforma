// Run after installing @playwright/test and its Chromium browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {BOND_QUESTIONS} from '../bond-practice.js';
const root=new URL('../',import.meta.url);
const source=readFileSync(new URL('app.js',root),'utf8');
const start=source.indexOf('function chemicalBondBridgeTheory(){');
const end=source.indexOf('\nfunction ',start+10);
const ctx={};vm.runInNewContext(source.slice(start,end)+';this.theory=chemicalBondBridgeTheory();',ctx);
const fixture=`<!doctype html><html lang="kk"><head><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/components.css"><link rel="stylesheet" href="/learning.css"><link rel="stylesheet" href="/bond-practice.css">
<style>body{margin:0}main{max-width:1100px;padding:16px;margin:auto;min-width:0}</style></head><body><main>${ctx.theory}<div id="practice"></div><div id="teacher">Teacher-authored content remains</div></main>
<script type="module">
import {BOND_PATH,bondPracticeView,createBondPractice} from '/bond-practice.js';
const item={id:'lesson',path:BOND_PATH};
const state={user:{id:'learner',role:'student'},progress:JSON.parse(localStorage.getItem('progress')||'[]')};
let fail=true;
const store={async submitBondPractice(id,attempt,answers){
 window.calls=(window.calls||0)+1;
 if(fail){fail=false;throw Error('offline');}
 const prior=state.progress[0]?.bond_practice||{};
 const score=answers.reduce((n,a,i)=>n+Number(a===[1,0,2,1,2,0,1,2][i]),0);
 const row={item_id:id,bond_practice:{version:2,score,best_score:Math.max(score,prior.best_score||0),attempt_count:(prior.attempt_count||0)+1,attempt_id:attempt}};
 localStorage.setItem('progress',JSON.stringify([row]));return row;
}};
const practice=createBondPractice({store,state});
document.querySelector('#practice').innerHTML=bondPracticeView();practice.bind(document,item);
window.changeUser=()=>{state.user={id:'other',role:'student'};state.progress=[];document.querySelector('#practice').innerHTML=bondPracticeView();practice.bind(document,item);};
</script></body></html>`;
test('desktop and mobile: immediate feedback, retry, save failure/retry, reload and account isolation',async()=>{
 const server=http.createServer((req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture);return;}
  if(!['/bond-practice.js','/bond-practice.css','/styles.css','/components.css','/learning.css'].includes(path)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',path.endsWith('.js')?'text/javascript':'text/css');res.end(readFileSync(new URL(path.slice(1),root)));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  for(const width of [1440,390,320]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port);
   await page.locator('[data-bp-question]').first().waitFor();
   assert.equal(await page.locator('.bond-bridge svg').count(),(ctx.theory.match(/<svg/g)||[]).length);
   assert.equal(await page.locator('#teacher').textContent(),'Teacher-authored content remains');
   assert.equal(await page.locator('[data-bp-save]').isDisabled(),true);
   // Wrong first choice is locked; feedback also identifies the correct answer.
   await page.locator('[data-bp-question="0"] [data-bp-answer="0"]').click();
   assert.match(await page.locator('[data-bp-question="0"] [data-bp-feedback]').textContent(),/Қате/);
   assert.equal(await page.locator('[data-bp-question="0"] .bp-right').count(),1);
   assert.equal(await page.locator('[data-bp-question="0"] button:disabled').count(),3);
   if(process.env.QA_SCREENSHOT_DIR){
    await page.locator('#bond-practice-title').scrollIntoViewIfNeeded();
    await page.screenshot({path:process.env.QA_SCREENSHOT_DIR+'/bond-practice-'+width+'.png'});
   }
   await page.locator('[data-bp-question="0"] a').click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'bond-ionic');
   for(let i=1;i<8;i++)await page.locator(`[data-bp-question="${i}"] [data-bp-answer="${BOND_QUESTIONS[i].answer}"]`).click();
   assert.match(await page.locator('[data-bp-summary]').textContent(),/Ұпай: 7 \/ 8/);
   await page.locator('[data-bp-save]').click();
   assert.match(await page.locator('[data-bp-status]').textContent(),/Сақтау орындалмады/);
   await page.locator('[data-bp-save]').click();
   await page.waitForFunction(()=>document.querySelector('[data-bp-status]').textContent.includes('сақталды'));
   assert.equal(await page.locator('[data-bp-save]').isDisabled(),true);
   await page.reload();await page.locator('[data-bp-question]').first().waitFor();
   assert.match(await page.locator('[data-bp-saved]').textContent(),/7\/8/);
   assert.match(await page.locator('[data-bp-summary]').textContent(),/Орындалды: 0/);
   for(let i=0;i<8;i++)await page.locator(`[data-bp-question="${i}"] [data-bp-answer="${BOND_QUESTIONS[i].answer}"]`).click();
   assert.match(await page.locator('[data-bp-summary]').textContent(),/Ұпай: 8 \/ 8/);
   await page.locator('[data-bp-reset]').click();
   assert.match(await page.locator('[data-bp-summary]').textContent(),/Орындалды: 0/);
   assert.equal(await page.locator('[data-bp-save]').isDisabled(),true);
   assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-bp-answer')),true);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,'document overflow at '+width);
   const tiny=await page.locator('[data-bp-answer]').evaluateAll(buttons=>buttons.some(b=>b.getBoundingClientRect().height<44));
   assert.equal(tiny,false);
   await page.evaluate(()=>window.changeUser());
   assert.equal(await page.locator('[data-bp-saved]').textContent(),'');
   assert.deepEqual(errors,[]);
   await context.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
});

