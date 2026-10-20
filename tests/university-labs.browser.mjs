import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {UNIVERSITY_LABS,labForPath} from '../university-labs.js';
const base='/universitet/ozin-ozi-daiyndau';
const fixture='<!doctype html><html lang="kk"><head><base href="/himya-platforma/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="school.css"></head><body><main id="host"></main><script type="module">'+
"import {UNIVERSITY_LABS,bindUniversityLabs} from './university-labs.js';"+
"const host=document.querySelector('#host');window.mount=(detail=false)=>{host.innerHTML=detail?'<main class=\"lesson-main\"><div class=\"lesson-body\">Авторлық теория</div><div class=\"resource-list\">Мұғалім материалы</div><section class=\"quiz-card\">Тест</section></main>':'<div class=\"lms-unit-list\">'+UNIVERSITY_LABS.map(lab=>'<a class=\"lms-unit-card\" href=\"/himya-platforma/universitet/ozin-ozi-daiyndau/'+lab.slug+'\">'+lab.title+'</a>').join('')+'</div>';const path='/universitet/ozin-ozi-daiyndau'+(detail?'/'+UNIVERSITY_LABS[1].slug:'');bindUniversityLabs(host,path);bindUniversityLabs(host,path);};mount();"+
'</script></body></html>';
test('topic mapping keeps CO2 separate from magnesium',()=>{
assert.equal(labForPath(base+'/zerthanalyq-sabaq-4-metall-ekvialentin-sudy-ygystyru-adisimen-anyqtau-magniidin-ekvivalenttik-massasyn-anyqtau'),undefined);
assert.equal(labForPath('/himya-platforma'+base+'/'+UNIVERSITY_LABS[1].slug+'/').file,'university-lab-co2.html');
assert.equal(labForPath('/mektep/'+UNIVERSITY_LABS[1].slug),undefined);
for(const lab of UNIVERSITY_LABS)assert.match(readFileSync(new URL('../'+lab.file,import.meta.url),'utf8'),/<html lang="kk">/);
});
test('teacher simulations run in responsive isolated embeds',async()=>{
const server=http.createServer((req,res)=>{
try{
const path=new URL(req.url,'http://localhost').pathname;
if(path==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture);}
const file=path.replace(/^\/himya-platforma\//,'');
if(!['university-labs.js','university-lab-co2.html','university-lab-classes.html','school.css'].includes(file)){res.writeHead(404);return res.end();}
res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/html; charset=utf-8');
res.end(readFileSync(new URL('../'+file,import.meta.url)));
}catch(e){res.writeHead(500);res.end(String(e));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{for(const width of [1440,390,320]){
const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/');
await page.locator('.university-html-lab').last().waitFor();
assert.equal(await page.locator('.university-html-lab').count(),2);
assert.equal(await page.locator('iframe[src]').count(),0);
for(const lab of UNIVERSITY_LABS){
const section=page.locator('[data-university-lab="'+lab.slug+'"]');
assert.equal(await section.locator('iframe').getAttribute('sandbox'),'allow-scripts');
assert.equal(await section.locator('a').getAttribute('rel'),'noopener noreferrer');
await section.locator('summary').click();
const frame=section.frameLocator('iframe');
if(lab.file.includes('co2')){
await frame.getByRole('button',{name:'Өлшеу',exact:true}).click();
await frame.getByRole('button',{name:'Таразыда өлшеу',exact:true}).click();
await frame.locator('#s2.active').waitFor();
await frame.getByRole('button',{name:'Kipp аппаратын қосу'}).click();
await frame.locator('#s3.active').waitFor();
await frame.getByRole('button',{name:'Суды құйып, цилиндрмен өлшеу'}).click();
await frame.locator('#s4.active').waitFor();
await frame.getByRole('button',{name:'Нәтижені есептеу'}).click();
await frame.locator('#result').waitFor({state:'visible'});
assert.match(await frame.locator('#mExp').textContent(),/\d+\.\d+ г\/моль/);
assert.doesNotMatch(await frame.locator('#mExp').textContent(),/NaN/);
}else{
await frame.getByRole('button',{name:'1. Қышқылдар',exact:true}).click();
await frame.locator('#acid1-btn').click();
await frame.locator('#acid1-result.show').waitFor();
await frame.locator('#acids textarea').fill('Лакмус қызылға боялды.');
await frame.getByRole('button',{name:'3. Тұздар',exact:true}).click();
await frame.locator('#salt2-btn1').click();
await frame.locator('#salt2-btn2').click();
await frame.locator('#salt2-result2.show').waitFor();
}
assert.equal(await section.locator('iframe').evaluate(el=>el.getBoundingClientRect().right<=innerWidth+1),true);
}
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
await page.evaluate(()=>mount(true));
assert.equal(await page.locator('.university-html-lab').count(),1);
assert.equal(await page.locator('.resource-list + .university-html-lab + .quiz-card').count(),1);
assert.equal(await page.locator('.resource-list').textContent(),'Мұғалім материалы');
assert.deepEqual(errors,[]);
await context.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
});
