import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.GAMES_QA_PLAYWRIGHT||'playwright');
test('mobile exercise flow, answer explanations, source, board persistence and topic separation',async()=>{
 const base=new URL('../',import.meta.url);
 const server=createServer(async(req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname.split('/').at(-1);
  try{
   res.setHeader('Content-Type',p.endsWith('.js')?'application/javascript':p.endsWith('.css')?'text/css':'text/html; charset=utf-8');
   res.end(await readFile(new URL(p,base)));
  }catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/himya-platforma/university-exercises.html';
 let browser;
 try{
  browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
  const page=await browser.newPage({viewport:{width:360,height:800},isMobile:true,hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);
  await page.getByRole('heading',{name:'БӨОЖ · Химия есептері мен жаттығулары'}).waitFor();
  assert.match(await page.locator('[data-task=homework]').textContent(),/PDF: 19-бет/);
  await page.getByRole('button',{name:'БӨЖ · өздік жұмыс'}).click();
  const practice=page.locator('[data-task=homework]'),homework=practice;
  assert.equal(await page.locator('#exercise-assignment option').count(),6);
  await practice.getByLabel('Шешу жазбасы').fill('V = nRT/P');
  const drawing=practice.locator('svg'); await drawing.scrollIntoViewIfNeeded();
  const b=await drawing.boundingBox();await page.mouse.move(b.x+12,b.y+16);await page.mouse.down();await page.mouse.move(b.x+80,b.y+47,{steps:4});await page.mouse.up();
  assert.equal(await drawing.locator('polyline').count(),1);
  await practice.getByLabel('Сандық жауап').fill('3');
  await practice.getByRole('button',{name:'Жауапты тексеру'}).click();
  assert.match(await practice.getByRole('status').textContent(),/сәйкес келмеді/);
  await practice.getByLabel('Сандық жауап').fill('400');
  await practice.getByRole('button',{name:'Жауапты тексеру'}).click();
  assert.match(await practice.getByRole('status').textContent(),/дұрыс/);
  assert.equal(await practice.locator('[data-solution]').getAttribute('open'),'');
  assert.match(await homework.textContent(),/PDF: 22-бет/);
  await page.reload();assert.equal(await practice.getByLabel('Шешу жазбасы').inputValue(),'V = nRT/P');
  assert.equal(await drawing.locator('polyline').count(),1);
  await practice.getByRole('button',{name:'Соңғы сызықты өшіру'}).click();
  assert.equal(await drawing.locator('polyline').count(),0);
  await page.locator('#exercise-assignment').selectOption('1');
  assert.equal(await practice.getByLabel('Шешу жазбасы').inputValue(),'');
  await page.getByLabel('Тақырып').selectOption('solutions');
  assert.equal(await page.locator('#exercise-assignment option').count(),19);
  assert.equal(await practice.getByLabel('Шешу жазбасы').inputValue(),'');
  assert.match(await homework.textContent(),/PDF: 81-бет/);
  assert.ok(await page.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
});