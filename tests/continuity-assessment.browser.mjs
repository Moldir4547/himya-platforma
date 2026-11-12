import {DIAGNOSTIC_BANK} from '../bridge-diagnostic-data.js';
import {diagnosticKey} from '../bridge-diagnostic.js';
import {TEXTBOOK_COMPARISONS} from '../bridge-evidence.js';

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
  await page.goto(base+'/himya-platforma/sabaktastyk-kopiri');
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
    const back=page.locator('.cp-feedback a');
    assert.equal(await back.getAttribute('href'),'#cb-reading-'+topic+'-'+i);
    await back.click();
    assert.equal(await page.locator('#cb-reading-'+topic+'-'+i+' .cb-micro-reading').evaluate(e=>e.open),true);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'cb-reading-'+topic+'-'+i);
    assert.equal(await page.locator('.cp-feedback').count(),1,'reading preserves submitted answer');
    assert.equal(await page.locator('.cb-step.cp-step-done').count(),i+1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,topic+' '+width+' '+i);
    await page.locator('[data-cp-next]').click();
   }
   await page.locator('[data-cp-result]').waitFor();
   assert.match(await page.locator('.cp-score').textContent(),wrongFirst?/3/:/4/);
   assert.ok((await page.locator('[data-cp-result]').textContent()).includes(CURRICULUM_REVIEW[topic].verdict));
   assert.equal(await page.locator('[data-cp-book-conclusion]').textContent(),TEXTBOOK_COMPARISONS[topic].conclusion);
   if(wrongFirst)assert.equal(await page.locator('[data-cp-result] li a').count(),1);
  }
  for(const topic of Object.keys(PRACTICE_TASKS)){
   await page.locator('[data-cb-topic="'+topic+'"]').click();
   const evidence=page.locator('[data-cb-evidence="'+topic+'"]');
   assert.ok((await evidence.textContent()).includes(TEXTBOOK_COMPARISONS[topic].conclusion));
   await evidence.locator('.cb-evidence-detail > summary').click();
   assert.equal(await evidence.locator('.cb-evidence-grid article').count(),3);
   for(const level of ['school','upper','university'])for(const ref of TEXTBOOK_COMPARISONS[topic][level].refs){
    assert.ok((await evidence.locator('.cb-evidence-detail').textContent()).includes('Кітап: '+ref.pages.join(', ')+'-бет'));
    assert.ok((await evidence.locator('.cb-evidence-detail').textContent()).includes('PDF: '+ref.pdf.join(', ')+'-бет'));
   }
   await evidence.locator('.cb-evidence-task > summary').click();
   await evidence.locator('.cb-evidence-task details > summary').click();
   assert.ok((await evidence.locator('.cb-evidence-task').textContent()).includes(TEXTBOOK_COMPARISONS[topic].answer));
   for(const source of await page.locator('.cb-step-source > summary').all())await source.click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'open citations '+topic+' '+width);
   await page.locator('.cb-evidence-overview > summary').click();
   assert.equal(await page.locator('.cb-evidence-overview tbody tr').count(),8);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'overview '+width);
   await page.locator('.cb-evidence-overview > summary').click();
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
 await page.goto(base+'/himya-platforma/sabaktastyk-kopiri');await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('[data-cp-form]').count(),0,'bridge retains existing sign-in requirement');
 await guest.close();
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});


test('personal diagnostics: baseline stays fixed, alternate questions, targeted reading, CSV, account isolation and unavailable storage',async()=>{
 const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  res.setHeader('Cache-Control','no-store');
  if(p==='/config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.__CHEM_CONFIG__={};');}
  if(p.startsWith('/api/')){
   const actor=req.headers.cookie?.match(/actor=(\w+)/)?.[1];
   res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify(p==='/api/session'?{user:actor?{id:actor,role:'student',display_name:'QA'}:null}:p==='/api/content'?DEFAULT_CONTENT:p==='/api/settings'?{}:[]));
  }
  const asset=p.split('/').pop(),name=/\.(js|css)$/.test(asset)?asset:'index.html';
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
 try{for(const width of [1440,320]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addCookies([{name:'actor',value:'learner',url:base}]);
  await page.goto(base+'/himya-platforma/sabaktastyk-kopiri');await page.locator('.bd-panel').waitFor();
  for(const [topic,pairs] of Object.entries(DIAGNOSTIC_BANK)){
   await page.locator('[data-cb-topic="'+topic+'"]').click();
   await page.locator('[data-bd-start="baseline"]').click();
   await page.locator('[data-bd-form] button[type=submit]').click();
   assert.match(await page.locator('[data-bd-error]').textContent(),/Үш сұрақ/);
   for(let i=0;i<3;i++)await page.locator('[data-bd-form] input[name="bd-'+i+'"][value="'+((pairs[i][0].answer+1)%3)+'"]').check();
   if(topic==='bond'){await page.reload();await page.locator('[data-bd-form]').waitFor();assert.equal(await page.locator('[data-bd-form] input:checked').count(),3,'partial responses restored');}
   await page.locator('[data-bd-form] button[type=submit]').click();
   assert.equal(await page.locator('.bd-baseline .bd-wrong').count(),3);
   const initial=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).topics,diagnosticKey('learner'));
   const link=page.locator('.bd-baseline a').first();await link.click();
   assert.equal(await page.locator('#cb-reading-'+topic+'-'+pairs[0][0].step+' .cb-micro-reading').evaluate(e=>e.open),true);
   await page.locator('[data-bd-start="followup"]').click();
   assert.ok((await page.locator('[data-bd-form]').textContent()).includes(pairs[0][1].prompt));
   for(let i=0;i<3;i++)await page.locator('[data-bd-form] input[name="bd-'+i+'"][value="'+pairs[i][1].answer+'"]').check();
   await page.locator('[data-bd-form] button[type=submit]').click();
   assert.equal(await page.locator('.bd-latest .bd-correct').count(),3);
   const after=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).topics,diagnosticKey('learner'));
   assert.deepEqual(after[topic].baseline,initial[topic].baseline,'later attempt must not rewrite initial evidence');
   await page.locator('.bd-map > summary').click();assert.equal(await page.locator('.bd-map-grid article').count(),8);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'diagnostic width '+width+' '+topic);
   await page.locator('.bd-map > summary').click();
  }
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-bd-export]').click();const download=await downloadPromise;
  const csv=readFileSync(await download.path(),'utf8');assert.equal(csv.split('\r\n').length,49);assert.doesNotMatch(csv,/learner|QA|@/);
  await context.addCookies([{name:'actor',value:'other',url:base}]);await page.reload();await page.locator('.bd-panel').waitFor();
  assert.equal(await page.locator('[data-bd-start="baseline"]').count(),1);
  await context.addCookies([{name:'actor',value:'learner',url:base}]);await page.reload();await page.locator('[data-bd-result]').waitFor();
  assert.equal(await page.locator('.bd-latest .bd-correct').count(),3);
  await page.locator('[data-bd-start="followup"]').click();
  for(let i=0;i<3;i++)await page.locator('[data-bd-form] input[name="bd-'+i+'"][value="'+((DIAGNOSTIC_BANK.bond[i][1].answer+1)%3)+'"]').check();
  await page.locator('[data-bd-form] button[type=submit]').click();
  assert.match(await page.locator('.bd-panel').textContent(),/Алғашқы кейінгі тексеру: 3\/3; соңғысы: 0\/3/);
  assert.equal(await page.locator('.bd-latest .bd-wrong a').count(),3);
  if(width===1440){
   await page.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('chembridge.diagnostic.'))throw Error('quota');return set.call(this,k,v);};});
   await page.locator('[data-bd-start="followup"]').click();
   assert.match(await page.locator('[data-bd-status]').textContent(),/Сақталмады/);
   assert.equal(await page.locator('[data-bd-form]').count(),1);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
