import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.GAMES_QA_PLAYWRIGHT||'playwright');
test('five grade mechanics, confetti, and a host and player connected to the same room',async()=>{
 const code='CF80BB01',ticket='00000000-0000-4000-8000-000000000888';let phase='waiting',nick=null,score=null;
 const question={prompt:'ЖОО емес, сынақ сұрағы: O₂ қалай жіктеледі?',choices:['Жай зат','Қоспа','Күрделі зат']};
 const srv=createServer(async(req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.split('/').at(-1);
  if(name==='config.js'){res.setHeader('Content-Type','application/javascript');return res.end('window.__CHEM_CONFIG__={supabaseUrl:location.origin,supabaseAnonKey:"test"};');}
  if(name.startsWith('cb_game_')){
   let body='';for await(const c of req)body+=c;const a=JSON.parse(body);let out;
   const host=req.headers.authorization==='Bearer test-token';
   if(name.endsWith('_create')&&host)out=code;
   if(name.endsWith('_join')&&a.p_code===code){nick=a.p_nick;out=ticket;}
   if(name.endsWith('_start')&&host){phase='playing';out=true;}
   if(name.endsWith('_submit')&&a.p_ticket===ticket){score=a.p_answers[0]===0?100:0;out=score;}
   if(name.endsWith('_state'))out={phase,seconds:120,total:1,score,...(host?{board:nick?[{nick,score}]:[]}:{questions:[question]})};
   res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(out??null));
  }
  const mime=name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8';
  try{res.setHeader('Content-Type',mime);res.end(await readFile(new URL('../'+name,import.meta.url)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+srv.address().port+'/himya-platforma/chem-missions.html';
 let browser;
 try{
  browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const host=await browser.newPage({viewport:{width:1440,height:930}}),student=await browser.newPage({viewport:{width:320,height:850}});
  const errors=[];host.on('pageerror',e=>errors.push(e.message));student.on('pageerror',e=>errors.push(e.message));
  await student.goto(url);await student.getByRole('button',{name:'Жай зат'}).click();await student.getByText('Жарайсың! +100 ұпай').waitFor();assert.ok(await student.locator('#salute b').count());
  await student.locator('#mission-grade').selectOption('8');for(const [i,n] of [2,1,2].entries())await student.locator('.coeff input').nth(i).fill(String(n));
  await student.getByRole('button',{name:'Тексеру'}).click();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.locator('#mission-grade').selectOption('9');await student.getByRole('button',{name:'AgCl',exact:true}).click();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.locator('#mission-grade').selectOption('10');
  assert.equal(await student.locator('[data-orbit]').count(),3);await student.locator('[data-orbit]').first().click();await student.getByRole('button',{name:'Тексеру'}).click();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.locator('#mission-level').selectOption('hard');assert.equal(await student.locator('[data-orbit]').count(),5);
  await student.locator('#mission-grade').selectOption('11');await student.locator('.answer').fill('40,0');await student.getByRole('button',{name:'Тексеру'}).click();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  assert.ok(await student.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  const fillCounts=async values=>{for(const [i,n] of values.entries())await student.locator('#mission-fields .answer').nth(i).fill(String(n));};
  const check=()=>student.getByRole('button',{name:'Тексеру',exact:true}).click();
  await student.goto(url+'?mission=balance&grade=8&difficulty=hard');
  await fillCounts([1,1,1]);await check();assert.match(await student.locator('#mission-explanation').textContent(),/Тең емес элементтер/);
  assert.equal(await student.locator('#atom-counts tbody tr').count(),2);
  await fillCounts([6,4,2]);await check();assert.match(await student.locator('#mission-explanation').textContent(),/ортақ бөлгішіне/);
  await fillCounts([3,2,1]);await check();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.locator('#mission-kind').selectOption('particles');
  await fillCounts([11,12,11]);await check();assert.match(await student.locator('#mission-explanation').textContent(),/e = Z/);
  assert.equal(await student.locator('#mission-fields .answer[aria-invalid="true"]').count(),1);
  await fillCounts([11,12,10]);await check();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.getByRole('button',{name:'Келесі тапсырма'}).click();
  await fillCounts([17,18,18]);await check();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  await student.locator('#mission-level').selectOption('easy');
  await fillCounts([6,6,6]);await check();assert.match(await student.locator('#motivation').textContent(),/Жарайсың/);
  assert.ok(await student.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await student.goto(url+'?mission=balance&grade=9&difficulty=hard');
  await check();assert.match(await student.locator('#mission-lives').textContent(),/3 \/ 3/);
  await fillCounts([1,1,1,1]);await check();assert.match(await student.locator('#mission-lives').textContent(),/2 \/ 3/);
  await student.reload();
  await fillCounts([1,3,3,2]);await check();
  await student.locator('#mission-next').click();
  await fillCounts([1,1,1,1]);await check();await check();
  assert.match(await student.locator('#mission-explanation').textContent(),/Дұрыс жауап:.*Fe\(OH\)₃.*Коэффициенттер/);
  assert.ok(await student.locator('#mission-fields button').isDisabled());
  await student.locator('#mission-kind').selectOption('particles');
  await student.locator('#mission-kind').selectOption('balance');
  await student.reload();
  assert.ok(await student.locator('#mission-fields button').isDisabled());
  assert.equal(await student.locator('#restart-mission').count(),0);
  assert.match(await student.locator('#mission-explanation').textContent(),/Дұрыс жауап:/);
  await student.locator('#mission-grade').selectOption('11');
  assert.match(await student.locator('#mission').textContent(),/KMnO₄/);
  assert.ok(await student.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  await student.goto(url+'?mission=code');
  assert.equal(await student.locator('.adventure-route .unlocked').count(),0);
  for(const index of [2,1,2,0,3]){
   await student.locator('[data-choice="'+index+'"]').click();
   assert.ok(await student.locator('#mission-next').isVisible());
   await student.locator('#mission-next').click();
  }
  await student.getByRole('heading',{name:/Құпия код: 87322/}).waitFor();
  await student.goto(url+'?mission=million');
  await student.locator('[data-choice="1"]').click();
  assert.match(await student.locator('.adventure-route .unlocked').textContent(),/10 000/);
  await student.goto(url+'?mission=treasure');
  await student.locator('[data-choice="2"]').click();
  assert.match(await student.locator('.adventure-route .unlocked').textContent(),/Жағалау/);
  await host.addInitScript(()=>localStorage.setItem('chem_supabase_session_v1',JSON.stringify({access_token:'test-token',expires_at:4102444800})));
  await host.goto(url);await host.getByRole('button',{name:'Сыныппен жарысу'}).click();await host.getByRole('button',{name:'Бөлме ашу'}).click();
  const link=await host.locator('#join-link').getAttribute('href');
  await student.goto(link);await student.getByLabel('Лақап ат').fill('Атом7');await student.getByRole('button',{name:'Қосылу',exact:true}).click();
  await host.getByRole('cell',{name:'Атом7'}).waitFor();await host.getByRole('button',{name:'Жарысты бастау'}).click();
  await student.getByRole('radio',{name:'Жай зат'}).check();await student.getByRole('button',{name:'Жауаптарды тапсыру'}).click();
  await student.getByText(/100 \/ 100 ұпай/).waitFor();await host.getByRole('cell',{name:'100',exact:true}).waitFor();
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>srv.close(r));}
});

