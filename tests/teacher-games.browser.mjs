import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {crossword} from '../teacher-crossword.js';
import {TOPICS} from '../teacher-games-data.js';
import {teacherRoute} from '../teacher-materials.js';
const {chromium}=await import(process.env.GAMES_QA_PLAYWRIGHT||'playwright');
test('teacher links, all three playable modes, keyboard controls and narrow layout',async()=>{
 const controller='/himya-platforma/mugalim-materialdary/ustaz';
 const server=createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  try{
   if(url.pathname===controller){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<base href="/himya-platforma/">'+teacherRoute('/mugalim-materialdary/ustaz',{state:{items:[],allResources:[]},shell:x=>x}));}
   const name=url.pathname.split('/').at(-1);
   if(!/^(teacher-[a-z-]+\.(js|css|html)|school-curriculum\.js)$/.test(name)){res.writeHead(404);return res.end();}
   res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');
   res.end(await readFile(new URL('../'+name,import.meta.url)));
  }catch(e){res.writeHead(500);res.end(String(e));}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 let b;
 try{
 b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 for(const width of [320,1440]){
  const p=await b.newPage({viewport:{width,height:900}}),errors=[];
  await p.goto(base+controller);
  const [q]=await Promise.all([p.waitForEvent('popup'),p.getByRole('link',{name:'HTML ойындарын ашу'}).click()]);
  q.on('pageerror',e=>errors.push(e.message));
  await q.locator('.board input').first().waitFor();
  const t=TOPICS[0],g=crossword(t.terms);
  for(const w of g.words)for(const [i,l] of Array.from(w.word).entries())await q.locator('#p'+((w.y+(w.horizontal?0:i))*g.width+w.x+(w.horizontal?i:0))).fill(l.toLowerCase());
  await q.getByRole('button',{name:'Тексеру',exact:true}).press('Enter');
  assert.equal(await q.locator('#result').textContent(),'Кроссворд толық шешілді!');
  await q.getByRole('button',{name:'Терминдер жұбы'}).click();
  for(const select of await q.locator('[data-pair]').all())await select.selectOption(await select.getAttribute('data-pair'));
  await q.getByRole('button',{name:'Тексеру',exact:true}).click();
  assert.match(await q.locator('#result').textContent(),/3 \/ 3/);
  await q.locator('#level').selectOption('university');
  await q.locator('#topic').selectOption('u-solutions');
  await q.getByRole('button',{name:'Химиялық код'}).click();
  await q.locator('[data-code]').fill('0,4');
  await q.getByRole('button',{name:'Тексеру',exact:true}).click();
  assert.match(await q.locator('.feedback').textContent(),/^Дұрыс/);
  await q.getByRole('button',{name:'Қайта бастау'}).click();
  assert.equal(await q.locator('[data-code]').inputValue(),'');
  await q.reload();
  assert.equal(await q.locator('#topic').inputValue(),'u-solutions');
  assert.ok(await q.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await q.clock.install();
  await q.locator('#difficulty').selectOption('hard');
  assert.equal(await q.locator('#clock').textContent(),'02:00');
  await q.locator('#seconds').selectOption('60');
  const start=q.getByRole('button',{name:'Бастау',exact:true}),num=q.locator('[data-code]');
  assert.equal(await num.isDisabled(),true);
  assert.equal(await q.locator('[data-reason] option').count(),4);
  await start.click();
  await num.fill('0,40');
  await q.locator('[data-reason]').selectOption('0');
  await q.clock.fastForward(15000);
  assert.match(await q.locator('#clock').textContent(),/^00:4[45]$/);
  await q.clock.fastForward(46000);
  assert.equal(await q.locator('#clock').textContent(),'00:00');
  assert.match(await q.locator('#round-status').textContent(),/Уақыт бітті/);
  assert.match(await q.locator('#result').textContent(),/1 \/ 1/);
  assert.equal(await num.isDisabled(),true);
  await q.getByRole('button',{name:'Қайта бастау'}).click();
  assert.equal(await num.inputValue(),'');
  await start.click();
  await num.fill('0.4');
  await q.locator('[data-reason]').selectOption('1');
  await q.getByRole('button',{name:'Тексеру',exact:true}).click();
  assert.match(await q.locator('.feedback').textContent(),/Сан дұрыс, негіздемені/);
  assert.match(await q.locator('#result').textContent(),/0 \/ 1/);
  await q.getByRole('button',{name:'Терминдер жұбы'}).click();
  assert.equal(await q.locator('[data-pair]').first().locator('option').count(),8);
  assert.equal(await q.locator('#clock').textContent(),'01:00');
  await q.locator('#seconds').selectOption('0');
  assert.equal(await start.isVisible(),false);
  assert.equal(await q.locator('[data-pair]').first().isDisabled(),false);
  await q.getByRole('button',{name:'Кроссворд'}).click();
  assert.doesNotMatch(await q.locator('.clues').textContent(),/әріп:/);
  assert.ok(await q.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  assert.deepEqual(errors,[]);
  await p.context().close();
 }
 }finally{await b?.close();await new Promise(r=>server.close(r));}
});
