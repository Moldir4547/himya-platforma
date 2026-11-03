
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {DEFAULT_CONTENT} from '../data.js';
const root=new URL('../',import.meta.url);
test('responsive reading, persistent day/night control and wide tables across real app routes',async()=>{
 const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://localhost').pathname.replace(/^\/himya-platforma(?=\/|$)/,'')||'/';
  res.setHeader('Cache-Control','no-store');
  if(p==='/config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.__CHEM_CONFIG__={};');}
  if(p.startsWith('/api/')){
   const member=req.headers.cookie?.includes('member=yes');res.setHeader('Content-Type','application/json');
   return res.end(JSON.stringify(p==='/api/session'?{user:member?{id:'reader',role:'admin',display_name:'QA'}:null}:p==='/api/content'?DEFAULT_CONTENT:p==='/api/settings'?{}:p==='/api/analytics'?{users:[],details:[]}:[]));
  }
  const asset=p.split('/').pop(),name=/\.(js|css)$/.test(asset)?asset:'index.html';
  if(!/^[a-zA-Z0-9_.-]+$/.test(name)){res.writeHead(404);return res.end();}
  try{res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(readFileSync(new URL(name,root)));}catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch();
 const routes=['/','/mektep','/mektep/teoriya/7-synyp','/mektep/teoriya/7-synyp/structure-isotopes','/mektep/teoriya/7-synyp/structure-isotopes#lab','/universitet','/universitet/teoriya','/universitet/sillabus','/universitet/agymdyk-bakylau','/universitet/bilim-kartasy','/sabaktastyk-kopiri/himiyalyk-bailanys','/sabaktastyk-kopiri/ekvivalent-ugymy','/mugalim-materialdary','/materials','/kabinet','/login','/register'];
 try{
 for(const width of [320,390,768,844,1101,1440]){
  const height=width===844?430:980;
  const context=await browser.newContext({viewport:{width,height},colorScheme:'light',reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addCookies([{name:'member',value:'yes',url:base}]);
  const mode=()=>page.locator('html').getAttribute('data-theme');
  const open=async route=>{await page.goto(base+'/himya-platforma'+route);try{await page.locator('[data-appearance-toggle]').waitFor({timeout:10000});}catch{throw Error(JSON.stringify({route,errors,url:page.url()}));}await page.waitForLoadState('networkidle');};
  async function fits(label){
   const info=await page.evaluate(()=>({fits:document.documentElement.scrollWidth<=innerWidth+1,bad:Array.from(document.querySelectorAll('#app *')).filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,6).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))}));
   assert.equal(info.fits,true,label+' '+JSON.stringify(info.bad));
  }
  for(const selected of ['light','dark']){
   await open('/');if(await mode()!==selected)await page.locator('[data-appearance-toggle]').click();
   for(const route of routes){
    console.log('READING_ROUTE',width,selected,route);
    await open(route);
    assert.equal(await mode(),selected,route);
    assert.equal(await page.locator('[data-appearance-toggle]').count(),1);
    await fits(width+' '+selected+' '+route);
    const box=await page.locator('[data-appearance-toggle]').boundingBox();assert.ok(box.width>=44&&box.height>=44);
    if(route.includes('/structure-isotopes')&&!route.includes('#lab')&&selected==='dark'){
     for(const el of await page.locator('.school-notes article,.school-visual,.school-panel').all()){
      const bg=await el.evaluate(e=>getComputedStyle(e).backgroundColor);
      assert.notEqual(bg,'rgb(255, 255, 255)','reading surface must follow dark mode');
     }
    }
    if(route==='/'){
     const contrast=await page.locator('.cp-prompt').evaluate(el=>{
      const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
      const lum=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
      const fg=rgb(getComputedStyle(el).color);let n=el,bg=null;
      while(n){const c=getComputedStyle(n).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent'){bg=rgb(c);break;}n=n.parentElement;}
      const a=lum(fg),b=lum(bg||[255,255,255]);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
     });assert.ok(contrast>=4.5,'prompt contrast '+selected+' '+contrast);
     const menu=page.getByRole('button',{name:'Мәзір',exact:true});
     if(await menu.isVisible()){
      await menu.click();const nav=await page.getByRole('navigation',{name:'Негізгі навигация'}).boundingBox();assert.ok(nav.y+nav.height<=height+1,'menu fits '+width);
      await page.getByRole('navigation',{name:'Негізгі навигация'}).getByRole('link',{name:'Мектеп',exact:true}).click();
      await page.waitForURL('**/mektep');assert.equal(await mode(),selected);
     }
    }
   }
  }
  await open('/');const before=await mode();await page.locator('[data-appearance-toggle]').press('Enter');assert.notEqual(await mode(),before);
  const chosen=await mode();await page.reload();await page.locator('[data-appearance-toggle]').waitFor();assert.equal(await mode(),chosen);
  await page.evaluate(()=>{const section=document.createElement('section');section.id='reading-fixture';section.innerHTML='<table><caption>Күрделі салыстыру кестесі</caption><tbody><tr>'+Array.from({length:8},(_,i)=>'<th>Шама '+i+'</th>').join('')+'</tr><tr>'+Array.from({length:8},(_,i)=>'<td>'+('Өлшем_'+i+'_').repeat(10)+'</td>').join('')+'</tr></tbody></table>';document.querySelector('.site-shell').append(section);});
  await page.locator('#reading-fixture .mobile-table-scroll').waitFor();assert.equal(await page.locator('#reading-fixture td').count(),8);await fits('wide table');
  if(width<768){const wrap=page.locator('#reading-fixture .mobile-table-scroll');await wrap.focus();assert.equal(await wrap.getAttribute('tabindex'),'0');assert.equal(await wrap.evaluate(e=>e.scrollWidth>e.clientWidth),true);}
  
  if(await mode()!=='dark')await page.locator('[data-appearance-toggle]').click();
  await page.evaluate(()=>{const fixture=document.createElement('section');fixture.id='night-colour-fixture';fixture.innerHTML='<div class="file-viewer"><header>Құжат үлгісі</header><div class="viewer-canvas"><p>Оқу құжатының анық мәтіні</p></div><footer>Құжат</footer></div><div class="school-feedback correct">Дұрыс жауап</div><div class="school-feedback incorrect">Қате жауап</div>';document.querySelector('.site-shell').append(fixture);});
  const colours=await page.locator('#night-colour-fixture').evaluate(el=>({paper:getComputedStyle(el.querySelector('.viewer-canvas')).backgroundColor,text:getComputedStyle(el.querySelector('.viewer-canvas p')).color,good:getComputedStyle(el.querySelector('.correct')).backgroundColor,bad:getComputedStyle(el.querySelector('.incorrect')).backgroundColor,surface:getComputedStyle(document.documentElement).getPropertyValue('--sheet').trim()}));
  assert.equal(colours.paper,'rgb(245, 247, 250)','document source paper stays light in night mode');
  assert.equal(colours.text,'rgb(23, 46, 73)','document text remains dark on paper');
  assert.notEqual(colours.good,colours.bad,'correct and incorrect feedback retain distinct backgrounds');
  assert.deepEqual(errors,[]);await context.close();
 }
 const system=await browser.newContext({colorScheme:'dark',viewport:{width:390,height:900}}),p=await system.newPage();
 await p.goto(base+'/himya-platforma/');await p.locator('[data-appearance-toggle]').waitFor();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
 for(const route of ['/login','/register']){
  await p.goto(base+'/himya-platforma'+route);await p.locator('[data-appearance-toggle]').waitFor();await p.waitForLoadState('networkidle');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'guest form '+route);
  assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
 }
 await p.emulateMedia({colorScheme:'light'});await p.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await p.locator('[data-appearance-toggle]').click();await p.emulateMedia({colorScheme:'light'});assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
 const second=await system.newPage();await second.goto(base+'/himya-platforma/');await second.locator('[data-appearance-toggle]').waitFor();
 await p.locator('[data-appearance-toggle]').click();await second.waitForFunction(()=>document.documentElement.dataset.theme==='light');
 await p.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('denied');};});
 await p.locator('[data-appearance-toggle]').click();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');assert.equal(await p.locator('#appearance-status').getAttribute('data-visible'),'true');
 await system.close();
 }finally{await browser.close();await new Promise(r=>server.close(r));}
});
