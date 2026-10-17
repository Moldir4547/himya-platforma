import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
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
