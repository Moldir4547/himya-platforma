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
  assert.deepEqual(errors,[]);
  await p.context().close();
 }
 }finally{await b?.close();await new Promise(r=>server.close(r));}
});
