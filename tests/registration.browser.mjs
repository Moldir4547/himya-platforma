import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {DEFAULT_CONTENT} from '../data.js';
const root=new URL('../',import.meta.url);
test('actual registration form: required category, pending confirmation, phone layout',async()=>{
 const signups=[];
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  res.setHeader('Cache-Control','no-store');
  if(path==='/config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.__CHEM_CONFIG__={supabaseUrl:"http://127.0.0.1:'+server.address().port+'",supabaseAnonKey:"sb_publishable_test"};');return;}
  if(path==='/auth/v1/signup'){let raw='';for await(const part of req)raw+=part;signups.push(JSON.parse(raw));res.setHeader('Content-Type','application/json');res.end(JSON.stringify({user:{id:'pending-test-user'}}));return;}
  if(path.startsWith('/rest/v1/')){res.setHeader('Content-Type','application/json');res.end('[]');return;}
  const name=path==='/register'?'index.html':path.slice(1);
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);res.end();return;}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{for(const width of [1440,390,320]){const context=await browser.newContext({viewport:{width,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port+'/register');await page.getByLabel('Мен кіммін?').waitFor();await page.getByLabel('Аты-жөні').fill('QA Participant');await page.locator('input[name="username"]').fill('qa_participant');await page.getByLabel('Email',{exact:true}).fill('qa@example.test');await page.getByLabel('Пароль',{exact:true}).fill('Test12345!');const before=signups.length;await page.getByRole('button',{name:'Тіркелу',exact:true}).click();assert.equal(signups.length,before);
 for(const category of ['school_student','university_student','teacher']){await page.getByLabel('Мен кіммін?').selectOption(category);const response=page.waitForResponse(r=>r.url().includes('/auth/v1/signup'));await page.getByRole('button',{name:'Тіркелу',exact:true}).click();await response;await page.waitForFunction(()=>document.querySelector('#auth-error')?.textContent.includes('Тіркелу сәтті'));assert.equal(signups.at(-1).data.participant_type,category);assert.notEqual(signups.at(-1).data.role,'admin');assert.equal(await page.getByRole('button',{name:'Тіркелу',exact:true}).isEnabled(),true);}
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);assert.deepEqual(errors,[]);await context.close();}}
 finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
});


test('learner navigation: three paths, guest return route, menu and mobile layout',async()=>{
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  res.setHeader('Cache-Control','no-store');
  if(path==='/config.js'){res.setHeader('Content-Type','text/javascript');res.end('window.__CHEM_CONFIG__={};');return;}
  if(path==='/api/session'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({user:req.headers.cookie?.includes('fixture=member')?{id:'learner',role:'student',display_name:'QA Learner'}:null}));return;}
  if(path==='/api/content'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(DEFAULT_CONTENT));return;}
  if(path==='/api/progress'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify([{item_id:'bridge-bond',progress:25,last_opened:'2026-10-17T00:00:00Z'},{item_id:'bridge-redox',progress:100,completed:true,last_opened:'2026-10-17T01:00:00Z'}]));return;}
  if(path==='/api/settings'){res.setHeader('Content-Type','application/json');res.end('{}');return;}
  if(path.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end('[]');return;}
  const asset=path.split('/').pop();
  const name=/\.(js|css)$/.test(asset)?asset:'index.html';
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);res.end();return;}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{for(const width of [1440,1101,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:'+server.address().port;
  await page.goto(base+'/himya-platforma/');
  await page.getByRole('heading',{name:'Өзіңізге қажет бөлімді таңдаңыз'}).waitFor();
  assert.equal(await page.locator('.direction-card').count(),3);
  assert.equal(await page.locator('.empty-library').count(),0,'guests should see the sign-in explanation, not an empty catalogue');
  assert.equal(await page.locator('.continuity-details').getAttribute('open'),null);
  await page.locator('.continuity-details > summary').click();
  assert.equal(await page.getByRole('button',{name:'Байланыс бар',exact:true}).isVisible(),true);
  await page.locator('.continuity-details > summary').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'home overflow at '+width);
  await page.getByRole('link',{name:'Көпірден бастау',exact:false}).click();
  await page.getByRole('heading',{name:'Қош келдіңіз'}).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('next'),'/sabaktastyk-kopiri');
  await page.getByRole('link',{name:'Тіркелу',exact:true}).click();
  await page.getByLabel('Мен кіммін?').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('next'),'/sabaktastyk-kopiri');
  await page.goto(base+'/himya-platforma/');
  await page.getByRole('heading',{name:'Өзіңізге қажет бөлімді таңдаңыз'}).waitFor();
  const menu=page.getByRole('button',{name:'Мәзір',exact:true});
  if(await menu.isVisible()){await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');}
  await page.getByRole('navigation',{name:'Негізгі навигация'}).getByRole('link',{name:'Мектеп',exact:true}).click();
  await page.getByRole('heading',{name:'Қош келдіңіз'}).waitFor();
  assert.equal(new URL(page.url()).searchParams.get('next'),'/mektep');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await context.addCookies([{name:'fixture',value:'member',url:base}]);
  await page.goto(base+'/himya-platforma/');
  await page.locator('.continue-learning').waitFor();
  assert.equal(await page.locator('.continue-learning strong').textContent(),'Химиялық байланыс');
  assert.equal(await page.locator('.continue-learning a').getAttribute('href'),'/himya-platforma/sabaktastyk-kopiri/himiyalyk-bailanys');
  await page.getByRole('link',{name:'Оқуды бастау',exact:false}).click();
  await page.getByRole('heading',{name:'Қай бөлімнен бастайсыз?'}).waitFor();
  assert.equal(await page.locator('.direction-group').count(),3);
  assert.equal(await page.locator('.direction-group').getByRole('heading',{name:'Мектеп',exact:true}).count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'member directions overflow at '+width);
  assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
});
