
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {DEFAULT_CONTENT} from '../data.js';
import {PRACTICE_TASKS,SOURCE_DOCUMENTS,CURRICULUM_REVIEW,practiceKey} from '../continuity-assessment.js';
const root=new URL('../',import.meta.url);
test('continuity practice: 32 interactive tasks, evidence, conclusions, retry, persistence and user isolation at desktop/phone widths',async()=>{
 const writes=[],server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  if(req.method!=='GET')writes.push(p);
  res.setHeader('Cache-Control','no-store');
  if(p==='/config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.__CHEM_CONFIG__={};');}
  if(p.startsWith('/api/')){
   const actor=req.headers.cookie?.match(/actor=(\w+)/)?.[1];
   const resources=Object.values(SOURCE_DOCUMENTS).map(s=>({id:s.resource,item_id:'grade-8',filename:s.filename,url:'https://example.org/source.docx'}));
   res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify(p==='/api/session'?{user:actor?{id:actor,role:'student',display_name:'QA'}:null}:p==='/api/content'?DEFAULT_CONTENT:p==='/api/resources'?resources:p==='/api/settings'?{}:[]));
  }
  const asset=p.split('/').pop(),name=/\.(js|css)$/.test(asset)?asset:'index.html';
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
 try{for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addCookies([{name:'actor',value:'learner',url:base}]);
  await page.goto(base+'/himya-platforma/');
  await page.locator('[data-cp-form]').waitFor();
  async function complete(topic,wrongFirst=false){
   const qs=PRACTICE_TASKS[topic];
   for(let i=0;i<4;i++){
    const form=page.locator('[data-cp-form]'),q=qs[i];
    await form.getByRole('button',{name:'Жауапты тексеру',exact:true}).click();
    assert.ok((await form.locator('[data-cp-error]').textContent()).length>0);
    if(q.kind==='choice')await form.locator('input[name=option][value="'+(wrongFirst?(q.answer+1)%q.options.length:q.answer)+'"]').check();
    if(q.kind==='match')for(let k=0;k<q.answers.length;k++)await form.locator('[name="match-'+k+'"]').selectOption(String(q.answers[k]));
    if(q.kind==='model'){
     await form.locator('[data-cp-scenario]').selectOption('1');
     await page.locator('[data-cp-form] input[name=option][value="'+q.cases[1].answer+'"]').check();
    }
    if(q.kind==='number')await form.locator('input[name=number]').fill(String(q.answer).replace('.',','));
    await page.locator('[data-cp-form]').getByRole('button',{name:'Жауапты тексеру',exact:true}).click();
    await page.locator('.cp-feedback').waitFor();
    assert.equal(await page.locator('.cp-wrong').count(),wrongFirst&&i===0?1:0);
    assert.match(await page.locator('.cp-feedback a').getAttribute('href'),/^\/himya-platforma\//);
    assert.equal(await page.locator('.cb-step.cp-step-done').count(),i+1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,topic+' '+width+' '+i);
    await page.locator('[data-cp-next]').click();
   }
   await page.locator('[data-cp-result]').waitFor();
   assert.match(await page.locator('.cp-score').textContent(),wrongFirst?/3/:/4/);
   assert.ok((await page.locator('[data-cp-result]').textContent()).includes(CURRICULUM_REVIEW[topic].verdict));
   if(wrongFirst)assert.equal(await page.locator('[data-cp-result] li a').count(),1);
  }
  for(const topic of Object.keys(PRACTICE_TASKS)){
   await page.locator('[data-cb-topic="'+topic+'"]').click();
   await complete(topic,topic==='atom');
   if(topic==='bond'){
    await page.locator('.cp-goals summary').click();
    assert.ok((await page.locator('.cp-goals').textContent()).includes('8.1.4.1'));
    await page.locator('[data-cp-source="8"]').click();
    await page.locator('[data-cp-source-status] a').waitFor();
    assert.equal(await page.locator('[data-cp-source-status] a').getAttribute('href'),'https://example.org/source.docx');
    await page.locator('.cp-goals summary').click();
   }
  }
  await page.locator('.cp-overview summary').click();
  assert.equal(await page.locator('.cp-overview li').count(),8);
  await page.reload();await page.locator('[data-cp-result]').waitFor();
  assert.match(await page.locator('.cp-score').textContent(),/4/);
  await page.locator('[data-cp-retry]').click();
  assert.equal(await page.locator('.cb-step.cp-step-done').count(),0);
  await complete('bond',true);
  assert.match(await page.locator('[data-cp-result]').textContent(),/Әрекет №2/);
  assert.match(await page.locator('[data-cp-result]').textContent(),/ең жақсы нәтиже: 4\/4/);
  await context.addCookies([{name:'actor',value:'other',url:base}]);await page.reload();await page.locator('[data-cp-form]').waitFor();
  assert.equal(await page.locator('.cb-step.cp-step-done').count(),0);
  await context.addCookies([{name:'actor',value:'learner',url:base}]);await page.reload();await page.locator('[data-cp-result]').waitFor();
  assert.match(await page.locator('.cp-score').textContent(),/3/);
  await page.locator('[data-cp-retry]').click();
  if(width===1440){
   await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('chembridge.continuity-practice.'))throw Error('storage unavailable');return original.call(this,k,v);};});
   await page.locator('[data-cp-form] input[name=option]').first().check();
   await page.locator('[data-cp-form]').getByRole('button',{name:'Жауапты тексеру',exact:true}).click();
   assert.match(await page.locator('[data-cp-save-status]').textContent(),/сақталмады/);
  }
  assert.equal(writes.length,0,'practice must not modify official scores or documents');
  assert.deepEqual(errors,[]);await context.close();
 }
 const guest=await browser.newContext(),page=await guest.newPage();
 await page.goto(base+'/himya-platforma/');await page.locator('[data-cp-form]').waitFor();
 assert.match(await page.locator('.cp-storage-note').textContent(),/Қонақ/);
 await page.locator('[data-cp-form] input[name=option][value="1"]').check();await page.locator('[data-cp-form]').getByRole('button',{name:'Жауапты тексеру',exact:true}).click();
 await page.reload();await page.locator('[data-cp-form]').waitFor();assert.equal(await page.locator('.cp-feedback').count(),0);
 await guest.close();
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
