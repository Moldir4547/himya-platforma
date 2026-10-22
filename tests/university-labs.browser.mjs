import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {UNIVERSITY_LABS,labForPath} from '../university-labs.js';
const base='/universitet/ozin-ozi-daiyndau';
const fixture='<!doctype html><html lang="kk"><head><base href="/himya-platforma/"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="school.css"></head><body><main id="host"></main><script type="module">'+
"import {UNIVERSITY_LABS,bindUniversityLabs} from './university-labs.js';"+
"const host=document.querySelector('#host');window.mount=(detail=false)=>{host.innerHTML=detail?'<main class=\"lesson-main\"><div class=\"lesson-body\">Авторлық теория</div><div class=\"resource-list\">Мұғалім материалы</div><section class=\"quiz-card\">Тест</section></main>':'<div class=\"lms-unit-list\">'+UNIVERSITY_LABS.map(lab=>'<a class=\"lms-unit-card\" href=\"/himya-platforma/universitet/ozin-ozi-daiyndau/'+(lab.matchTopic?'author-'+lab.slug:lab.slug)+'\">'+lab.title+'</a>').join('')+'</div>';const path='/universitet/ozin-ozi-daiyndau'+(detail?'/'+UNIVERSITY_LABS[1].slug:'');bindUniversityLabs(host,path);bindUniversityLabs(host,path);};mount();"+
'</script></body></html>';
test('topic mapping keeps CO2 separate from magnesium',()=>{
assert.equal(labForPath(base+'/zerthanalyq-sabaq-4-metall-ekvialentin-sudy-ygystyru-adisimen-anyqtau-magniidin-ekvivalenttik-massasyn-anyqtau').file,'university-lab-metal.html');
assert.equal(labForPath('/himya-platforma'+base+'/'+UNIVERSITY_LABS[1].slug+'/').file,'university-lab-co2.html');
assert.equal(labForPath('/mektep/'+UNIVERSITY_LABS[1].slug),undefined);
assert.equal(labForPath(base+'/admin-created-lesson','№6 Химиялық реакция жылдамдығы және химиялық тепе-теңдік').file,'university-lab-kinetics.html');
assert.equal(labForPath('/universitet/darister/topic','Реакция жылдамдығы және тепе-теңдік'),undefined);
assert.equal(labForPath(base+'/number-5','№5 CO₂ молярлық массасы'),undefined);
assert.equal(labForPath(base+'/rate-only','Реакция жылдамдығы'),undefined);
assert.equal(labForPath(base+'/teacher-created-topic','№7 Әртүрлі концентрациялы ерітінділер дайындау').file,'university-lab-solutions.html');
assert.equal(labForPath('/mektep/topic','Ерітінділер дайындау'),undefined);
assert.equal(labForPath(base+'/properties','Ерітінділердің қасиеттері'),undefined);
for(const lab of UNIVERSITY_LABS)assert.match(readFileSync(new URL('../'+lab.file,import.meta.url),'utf8'),/<html lang="kk">/);
});
test('teacher simulations run in responsive isolated embeds',async()=>{
const server=http.createServer((req,res)=>{
try{
const path=new URL(req.url,'http://localhost').pathname;
if(path==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture);}
const file=path.replace(/^\/himya-platforma\//,'');
if(!['university-labs.js','university-lab-co2.html','university-lab-classes.html','university-lab-metal.html','university-lab-kinetics.html','university-lab-solutions.html','school.css'].includes(file)){res.writeHead(404);return res.end();}
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
assert.equal(await page.locator('.university-html-lab').count(),5);
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
}else if(lab.file.includes('metal')){
const metal=width===1440?'Mg':width===390?'Zn':'Fe';
await frame.locator('#metal').selectOption(metal);
for(let step=1;step<=9;step++){
 await frame.locator('#s'+step+'.active').waitFor();
 await frame.locator('#b'+step).click();
}
await frame.locator('#res').waitFor({state:'visible'});
const result=await frame.locator('#eP').textContent();
assert.match(result,/Э = \d+,\d+ г\/моль/);
const value=Number(result.match(/\d+,\d+/)[0].replace(',','.'));
const expected={Mg:12.1525,Zn:32.69,Fe:27.9225}[metal];
assert.ok(Math.abs(value-expected)/expected<0.12,'equivalent mass is consistent with selected metal');
assert.match(await frame.locator('#res').textContent(),{Mg:/Магнийдің/,Zn:/Мырыштың/,Fe:/Темірдің/}[metal]);
assert.equal(await frame.locator('#metal').isDisabled(),true);
}else if(lab.file.includes('solutions')){
const given=await frame.locator('#stD').textContent(),match=given.match(/ω₁ = ([\d,]+) %, ρ₁ = ([\d,]+) г\/мл/);
assert.ok(match,'displayed starting concentration and density');
const w=Number(match[1].replace(',','.')),rho=Number(match[2].replace(',','.'));
for(const id of ['mc','Vc','Vw'])await frame.locator('#in_'+id).fill('0');
await frame.locator('#go').click();
assert.match(await frame.locator('#askMsg').textContent(),/дұрыс емес/);
assert.equal(await frame.locator('#li0.done').count(),0);
const mass=250*10/w;
for(const [id,value] of Object.entries({mc:mass,Vc:mass/rho,Vw:250-mass}))await frame.locator('#in_'+id).fill(value.toFixed(3));
await frame.locator('#go').click();
await frame.locator('#li0.done').waitFor();
await frame.getByRole('button',{name:'Суды өлшеп құю',exact:true}).click();
await frame.locator('#li1.done').waitFor();
assert.equal(await frame.locator('#li2.cur').count(),1);
}else if(lab.file.includes('kinetics')){
await frame.getByRole('button',{name:'Na₂S₂O₃ құю',exact:true}).click();
await frame.locator('#li0.done').waitFor();
assert.equal(await frame.locator('#t100_1').textContent(),'5');
assert.equal(await frame.locator('#t101_1').textContent(),'10');
assert.equal(await frame.locator('#t102_1').textContent(),'15');
assert.equal(await frame.getByRole('button',{name:'Су қосу',exact:true}).isEnabled(),true);
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
assert.equal(await frame.locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'experiment fits its frame');
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
