import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
import {DEFAULT_CONTENT} from '../data.js';
import {JOURNEY_PATH,TEACHING_TRACKS,CONTINUITY_LADDERS} from '../teacher-journey.js';
const root=new URL('../',import.meta.url);
test('real app teacher journey: home, five comparisons, draft isolation, feedback, print and admin coverage on desktop/phone',async()=>{
 const writes=[],resources=[
  {id:'slide7',item_id:'grade-7',filename:'Атомдар.pptx'},
  {id:'sheet7',item_id:'grade-7',filename:'Жұмыс парағы. Атомдар.pdf'},
  {id:'slide8',item_id:'grade-8',filename:'Химиялық байланыс.pptx'}
 ];
 const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')writes.push(p);
  if(p==='/config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.__CHEM_CONFIG__={};');}
  if(p.startsWith('/api/')){
   const actor=req.headers.cookie?.match(/actor=(\w+)/)?.[1];
   res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify(p==='/api/session'?{user:actor?{id:actor,role:actor==='admin'?'admin':'student',display_name:'QA'}:null}:p==='/api/content'?DEFAULT_CONTENT:p==='/api/resources'?resources:p==='/api/settings'?{}:[]));
  }
  const asset=p.split('/').pop(),name=/\.(js|css)$/.test(asset)?asset:'index.html';
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
 try{for(const width of [1440,1101,390,320]){
  const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/himya-platforma/');
  await page.locator('.tj-hero').waitFor();
  assert.equal(await page.locator('.direction-card').count(),3);
  assert.equal(await page.locator('.teacher-home-entry').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  
  assert.equal(await page.locator('.cb-chem-art').count(),1);
  assert.equal(await page.locator('.cb-continuity').count(),0,'full map moved off homepage');
  await page.getByRole('link',{name:'Білім баспалдағын ашу',exact:false}).click();
  await page.waitForURL('**/sabaktastyk-kopiri#continuity-ladder');
  assert.equal(new URL(page.url()).hash,'#continuity-ladder');
  await page.locator('#continuity-ladder').waitFor();
  assert.equal(await page.locator('[data-cb-topic]').count(),8);
  for(const track of CONTINUITY_LADDERS){
   await page.locator('[data-cb-topic="'+track.id+'"]').click();
   assert.equal(await page.locator('[data-cb-topic="'+track.id+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.cb-step').count(),4);
   assert.equal(await page.locator('.cb-depth-grid article').count(),3);
   assert.ok((await page.locator('.cb-depth-summary').textContent()).includes(track.difference));
   assert.ok((await page.locator('.cb-comparison').textContent()).includes('Мақсаттардың үйлесуі'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,track.id+' home '+width);
   for(const href of await page.locator('.cb-step a').evaluateAll(as=>as.map(a=>a.getAttribute('href'))))assert.ok(href.startsWith('/himya-platforma/'),href);
  }
  await page.locator('[data-cb-topic="atom"]').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-cb-topic="atom"]').getAttribute('aria-pressed'),'true');
  await page.getByRole('link',{name:'Салыстыру және жоспар',exact:false}).click();
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('[data-tj-plan]').count(),0);
  await context.addCookies([{name:'actor',value:'learner',url:base}]);
  await page.goto(base+'/himya-platforma'+JOURNEY_PATH);
  await page.locator('[data-teacher-journey]').waitFor();
  assert.equal(await page.locator('[data-tj-topic]').count(),5);
  assert.equal(await page.locator('.tj-audit').count(),0);
  for(const topic of TEACHING_TRACKS){
   await page.locator('[data-tj-topic="'+topic.id+'"]').click();
   assert.equal(new URL(page.url()).searchParams.get('topic'),topic.id);
   await page.locator('#tj-tab-university').click();
   await page.locator('#tj-tab-teach').click();
   assert.ok((await page.locator('.tj-proof').textContent()).includes(topic.evidence));
   await page.locator('[data-tj-answer="0"]').click();
   await page.locator('.tj-incorrect').waitFor();
   await page.locator('[data-tj-answer="1"]').click();
   await page.locator('.tj-correct').waitFor();
   assert.match(await page.locator('.tj-correct a').getAttribute('href'),/^\/himya-platforma\/mektep\//);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,topic.id+' '+width+' '+JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.tj-page *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,60),right:e.getBoundingClientRect().right})))));
  }
  await page.locator('[data-tj-topic="bond"]').click();
  await page.locator('#tj-tab-school').press('End');
  assert.equal(await page.locator('#tj-tab-teach').getAttribute('aria-selected'),'true');
  const answer='<img src=x onerror="alert(1)"> Оқушы молекуланы түсіндіреді.';
  await page.locator('textarea[name=goal]').fill(answer);
  await page.locator('[data-cb-topic="solutions"]').click();
  assert.equal(await page.locator('textarea[name=goal]').inputValue(),answer,'topic comparison must preserve unsaved plan');
  await page.getByRole('button',{name:'Жобаны осы браузерде сақтау',exact:true}).click();
  await page.locator('[data-tj-plan-status]').filter({hasText:'сақталды'}).waitFor();
  await page.reload();await page.locator('[data-tj-plan]').waitFor();
  assert.equal(await page.locator('textarea[name=goal]').inputValue(),answer);
  assert.equal(await page.locator('img[src=x]').count(),0);
  await page.evaluate(()=>{window.print=()=>{window.printed=true;};});
  await page.getByRole('button',{name:'Басып шығару',exact:true}).click();
  assert.equal(await page.locator('[data-tj-print-value=goal]').textContent(),answer);
  assert.equal(await page.evaluate(()=>window.printed),true);
  assert.match(await page.locator('.tj-plan-topic').textContent(),/Химиялық байланыс/);
  await context.addCookies([{name:'actor',value:'other',url:base}]);await page.reload();
  await page.locator('[data-tj-plan]').waitFor();
  assert.equal(await page.locator('textarea[name=goal]').inputValue(),'');
  assert.equal(await page.locator('.tj-correct,.tj-incorrect').count(),0);
  await context.addCookies([{name:'actor',value:'learner',url:base}]);await page.reload();await page.locator('[data-tj-plan]').waitFor();
  assert.equal(await page.locator('textarea[name=goal]').inputValue(),answer);
  if(width===1440){
   await page.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('chembridge.teaching-plan.'))throw Error('storage unavailable');return original.call(this,k,v);};});
   await page.locator('textarea[name=goal]').fill('Жаңа жоба бетте сақталып қалуы керек.');
   await page.getByRole('button',{name:'Жобаны осы браузерде сақтау',exact:true}).click();
   await page.locator('[data-tj-plan-status]').filter({hasText:'сақталмады'}).waitFor();
   await page.locator('[data-tj-topic="atom"]').click();
   assert.equal(await page.locator('textarea[name=goal]').inputValue(),'Жаңа жоба бетте сақталып қалуы керек.');
   assert.equal(await page.locator('[data-tj-topic="bond"]').getAttribute('aria-pressed'),'true');
  }
  await context.addCookies([{name:'actor',value:'admin',url:base}]);await page.reload();await page.locator('.tj-audit').waitFor();
  await page.locator('[data-tj-open-audit]').click();
  assert.equal(await page.locator('.tj-audit').evaluate(e=>e.open),true);
  assert.equal(await page.locator('[data-tj-audit-row]').count(),71);
  await page.locator('[data-tj-grade]').selectOption('8');
  assert.equal(await page.locator('[data-tj-audit-row]:visible').count(),16);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'admin table fits phone');
  assert.equal(writes.length,0,'planning must not forge official results or modify content');
  assert.deepEqual(errors,[]);
  mkdirSync(new URL('../test-output',import.meta.url),{recursive:true});
  await page.screenshot({path:new URL('../test-output/teacher-journey-'+width+'.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});
  await context.close();
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
});
