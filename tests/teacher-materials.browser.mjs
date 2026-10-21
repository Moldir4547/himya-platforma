import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
const items=[
 {id:'s',area:'school',path:'/mektep',title:'Мектеп',is_published:true},
 {id:'g',parent_id:'s',area:'school',path:'/mektep/teoriya/7-synyp',title:'7-сынып',is_published:true},
 {id:'u',area:'university',path:'/universitet',title:'ЖОО',is_published:true},
 {id:'l',parent_id:'u',area:'university',path:'/universitet/daris',title:'Дәріс',is_published:true},
 {id:'h',area:'school',path:'/hidden',title:'Жасырын',is_published:false}
];
const resources=[
 {id:'s1',item_id:'g',filename:'Атом.pptx',title:'Атом презентациясы'},
 {id:'s2',item_id:'g',filename:'Жұмыс.pdf',title:'Жұмыс парағы',url:'/fixture.pdf'},
 {id:'u1',item_id:'l',filename:'Силлабус.pdf',url:'/fixture.pdf'},
 {id:'hidden',item_id:'h',filename:'Жасырын.pdf'}
];
test('real app: teacher navigation, group isolation, combined filters, preview/download, guest return and phone layout',async()=>{
 const writes=[];
 const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  if(req.method!=='GET')writes.push(path);
  res.setHeader('Cache-Control','no-store');
  if(path==='/config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.__CHEM_CONFIG__={};');}
  if(path.startsWith('/api/')){
   res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify(path==='/api/session'?{user:req.headers.cookie?.includes('member=1')?{id:'qa',role:'student',display_name:'QA'}:null}:path==='/api/content'?items:path==='/api/resources'?resources:path==='/api/settings'?{}:[]));
  }
  if(path==='/fixture.pdf'){res.setHeader('Content-Type','application/pdf');return res.end('%PDF-1.4\n%%EOF');}
  const asset=path.split('/').pop(),name=/\.(js|css)$/.test(asset)?asset:'index.html';
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL('../'+name,import.meta.url)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
 const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const width of [1440,1101,390,320]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/himya-platforma/mugalim-materialdary/ustaz');
   await page.getByRole('heading',{name:'Қош келдіңіз'}).waitFor();
   assert.equal(new URL(page.url()).searchParams.get('next'),'/mugalim-materialdary/ustaz');
   await context.addCookies([{name:'member',value:'1',url:base}]);
   await page.goto(base+'/himya-platforma/mugalim-materialdary');
   await page.locator('.teacher-direction').last().waitFor();
   assert.equal(await page.locator('.teacher-direction').count(),2);
   await page.locator('.teacher-direction').filter({hasText:'Оқытушы'}).click();
   await page.locator('[data-open-resource="u1"]').waitFor();
   assert.equal(await page.locator('[data-open-resource="s1"]').count(),0);
   assert.match(await page.title(),/Оқытушы/);
   await page.getByRole('navigation',{name:'Материал бағыты'}).getByRole('link',{name:'Ұстаз',exact:false}).click();
   await page.locator('[data-open-resource="s1"]').waitFor();
   assert.equal(await page.locator('[data-teacher-entry]').count(),2);
   await page.getByLabel('Материал іздеу',{exact:true}).fill('АТОМ');
   assert.equal(await page.locator('[data-teacher-entry]:visible').count(),1);
   await page.getByLabel('Материал түрі',{exact:true}).selectOption('pdf');
   assert.equal(await page.locator('[data-teacher-entry]:visible').count(),0);
   assert.equal(await page.locator('[data-teacher-empty]').isVisible(),true);
   await page.getByLabel('Материал іздеу',{exact:true}).fill('');
   await page.getByRole('button',{name:'Жұмыс парағы — ашу',exact:true}).click();
   await page.locator('.file-frame').waitFor();
   assert.match(await page.locator('.file-frame').getAttribute('src'),/fixture.pdf/);
   await page.goto(base+'/himya-platforma/mugalim-materialdary/ustaz');
   const download=page.waitForEvent('download');
   await page.getByRole('button',{name:'Жұмыс парағы — жүктеп алу',exact:true}).click();
   assert.equal((await download).suggestedFilename(),'Жұмыс.pdf');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'overflow at '+width);
   const menu=page.getByRole('button',{name:'Мәзір',exact:true});if(await menu.isVisible())await menu.click();
   assert.match(await page.getByRole('navigation',{name:'Негізгі навигация'}).getByRole('link',{name:'Мұғалім материалдары',exact:true}).getAttribute('href'),/^\/himya-platforma\/mugalim-materialdary$/);
   assert.deepEqual(errors,[]);await context.close();
  }
  assert.deepEqual(writes,[],'read-only hub must not mutate content or progress');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
