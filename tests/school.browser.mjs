import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright';
const root=new URL('../',import.meta.url);
const fixture=String.raw`<!doctype html><html lang="kk"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/school.css"><link rel="stylesheet" href="/guided-lab.css"></head><body><main></main><script type="module">
import {createSchool,SCHOOL_UNITS,gradeSchoolAnswers} from '/school.js';import {DEFAULT_CONTENT} from '/data.js';const root=document.querySelector('main');window.state={user:{id:'learner',role:'student'},items:DEFAULT_CONTENT,progress:[]};window.units=SCHOOL_UNITS.map(u=>({slug:u.slug,grade:u.grade,path:u.path}));state.allResources=[
{id:'atom-slide',item_id:'grade-7',filename:'7 сынып. Атомдар. Молекулалар. Заттар.pptx'},
{id:'table-slide',item_id:'grade-7',filename:'7 сынып. Химиялық элементтердің периодтық кестесі.pptx'},
{id:'atom-sheet',item_id:'grade-7',filename:'Жұмыс парағы. Атомдар мен Молекулалар Заттардың құпиясы.pdf'},
{id:'theory',item_id:'grade-7',filename:'Атомдар теория.pdf'},
{id:'video',item_id:'grade-7',filename:'Атомдар.mp4'},
{id:'hidden-slide',item_id:'grade-7',filename:'Атомдар.pptx',is_published:false},
...[8,9,10,11].flatMap(g=>[{id:'slide-'+g,item_id:'grade-'+g,filename:'Химия '+g+' слайд.pptx'},{id:'sheet-'+g,item_id:'grade-'+g,filename:'Жұмыс парағы '+g+'.pdf'}])
];window.gradeMode=(g,mode)=>{window.path='/mektep/teoriya/'+g+'-synyp';history.replaceState({},'','/#'+mode);mount();};window.allLabPanels=()=>{let checked=0;for(const u of window.units){window.openUnit(u.slug);history.replaceState({},'','/#lab');mount();const p=root.querySelector('#school-panel');if(!p.querySelector('#chem-guided-lab')||p.querySelector('[data-school-form], [data-lab-control], [data-lab-picture], .school-notes'))throw Error('mixed lab panel '+u.slug);if(p.querySelector('[data-lab]').options.length!==({7:15,8:11,9:13,10:11,11:6})[u.grade])throw Error('wrong grade '+u.slug);checked++;}return checked;};window.attempts=[];let offline=true;window.path='/mektep/teoriya/7-synyp';const store={async submitSchoolActivity(item,slug,mode,id,answers){window.attempts.push(id);if(offline){offline=false;throw Error('offline');}const u=SCHOOL_UNITS.find(u=>u.slug===slug),row=state.progress.find(r=>r.item_id===item)||{item_id:item,school_learning:{}};row.school_learning[slug]??={};const old=row.school_learning[slug][mode]||{};row.school_learning[slug][mode]={...gradeSchoolAnswers(u,mode,answers),answers,attempt_id:id,best_score:Math.max(gradeSchoolAnswers(u,mode,answers).score,old.best_score||0),attempt_count:(old.attempt_count||0)+1};return row;}};const school=createSchool({state,store,shell:x=>x,render:mount,materials:()=>'<p data-preserved>Мұғалім слайды · бейне · жұмыс файлы</p>'+[
['atom-slide','7 сынып. Атомдар. Молекулалар. Заттар.pptx'],
['table-slide','7 сынып. Химиялық элементтердің периодтық кестесі.pptx'],
['atom-sheet','Жұмыс парағы. Атомдар мен Молекулалар Заттардың құпиясы.pdf']
].map(([id,title])=>'<article class="resource-card"><strong>'+title+'</strong><button data-open-resource="'+id+'">Ашу</button><button data-download-resource="'+id+'">Жүктеп алу</button></article>').join('')});function mount(){root.innerHTML=school.route(window.path);school.bind(root);}window.openUnit=slug=>{window.path=SCHOOL_UNITS.find(u=>u.slug===slug).path;history.replaceState({},'','/');mount();};window.switchOwner=()=>{state.user={id:'other',role:'student'};state.progress=[];mount();};mount();window.ready=true;
</script></body></html>`;
test('school grade navigation, nine tabs, immediate feedback, error retry, materials and models on desktop and phone',async()=>{const assets=new Set(['guided-lab-11-data.js','guided-lab-11-scene.js','guided-lab-10-data.js','guided-lab-10-scene.js','guided-lab-9-data.js','guided-lab-9-scene.js','guided-lab.js','guided-lab-model.js','guided-lab-data.js','guided-lab-8-data.js','guided-lab-8-scene.js','school.js','teacher-materials.js','catalog.js','platform-utils.js','school-materials.js','school-curriculum.js','school-labs.js','school.css','guided-lab.css','data.js']);const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');if(!name)res.end(fixture);else if(assets.has(name))res.end(readFileSync(new URL(name,root)));else{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});try{for(const width of [1440,390,320]){const ctx=await browser.newContext({viewport:{width,height:950}}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.ready);assert.equal(await page.locator('[data-school-card]').count(),10);await page.locator('[data-school-search]').fill('қоспалар');assert.equal(await page.locator('[data-school-card]:visible').count(),1);await page.evaluate(()=>window.openUnit('safety-mixtures'));assert.equal(await page.getByRole('tab').count(),9);await page.locator('[data-school-tab="bloom"]').first().click();await page.locator('[data-school-answer="0"][value="0"]').check();await page.locator('.incorrect').waitFor();await page.locator('.incorrect a').click();assert.equal(await page.locator('[role=tab][aria-selected=true]').textContent(),'Түсіну');await page.locator('[data-school-read]').click();await page.getByRole('status').filter({hasText:'Сақталмады'}).waitFor();await page.locator('[data-school-read]').click();await page.getByRole('status').filter({hasText:'аккаунтыңызда сақталды'}).waitFor();assert.equal(await page.evaluate(()=>attempts[0]===attempts[1]),true);await page.locator('[data-school-tab="materials"]').first().click();assert.equal(await page.locator('[data-preserved]').count(),1);

await page.evaluate(()=>window.openUnit('atoms-substances'));
await page.locator('[data-school-tab="presentation"]').first().click();
assert.equal(await page.locator('#school-panel .resource-card').count(),1);
assert.equal(await page.locator('[data-open-resource="atom-slide"]').count(),1);
assert.equal(await page.locator('[data-download-resource="atom-slide"]').count(),1);
assert.equal(await page.locator('[data-open-resource="table-slide"]').count(),0);
assert.equal(await page.locator('#school-panel [data-preserved],#school-panel .school-notes,#school-panel svg,#school-panel form,#school-panel iframe').count(),0);
assert.equal(await page.locator('[data-open-resource="theory"],[data-open-resource="video"],[data-open-resource="hidden-slide"]').count(),0);
await page.locator('[data-school-tab="worksheet"]').first().click();
assert.equal(await page.locator('[data-open-resource="atom-sheet"]').count(),1);
assert.equal(await page.locator('[data-open-resource="atom-slide"]').count(),0);
assert.equal(await page.locator('[data-download-resource="atom-sheet"]').count(),1);
assert.equal(await page.locator('#school-panel .resource-card').count(),1);
assert.equal(await page.locator('#school-panel form,#school-panel svg,#school-panel textarea,#school-panel .ws-reference,#school-panel .ws-concept,#school-panel [data-school-answer],#school-panel [data-worksheet-print],#school-panel [data-preserved]').count(),0);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
await page.evaluate(()=>window.openUnit('oxides'));
await page.locator('[data-school-tab="worksheet"]').first().click();
assert.equal(await page.locator('#school-panel .school-file-empty').count(),1);
assert.equal(await page.locator('#school-panel .resource-card,#school-panel form,#school-panel svg').count(),0);


for(const grade of [7,8,9,10,11]){
 await page.evaluate(g=>window.gradeMode(g,'presentation'),grade);
 assert.equal(await page.locator('[data-school-card],.school-notes,[data-preserved],#chem-guided-lab').count(),0);
 assert.equal(await page.locator('.resource-card').count(),grade===7?2:1);
 await page.evaluate(g=>window.gradeMode(g,'worksheet'),grade);
 assert.equal(await page.locator('.resource-card').count(),1);
 assert.equal(await page.locator('[data-open-resource="'+(grade===7?'atom-sheet':'sheet-'+grade)+'"]').count(),1);
 assert.equal(await page.locator('[data-school-card],.school-notes,[data-preserved],#chem-guided-lab,form,svg,.ws-reference,[data-worksheet-print]').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.getByRole('navigation',{name:grade+'-сынып бөлімдері'}).getByRole('link',{name:'Виртуалды зертхана',exact:true}).click();
 assert.equal(await page.locator('#chem-guided-lab[data-grade="'+grade+'"]').count(),1);
 assert.equal(await page.locator('[data-school-form],[data-lab-control],[data-lab-picture]').count(),0);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
}
if(width===1440)assert.equal(await page.evaluate(()=>window.allLabPanels()),71);
await page.evaluate(()=>window.openUnit('carbon'));
await page.locator('[data-school-tab="lab"]').first().click();
assert.equal(await page.locator('[data-lab]').inputValue(),'g8-carbonate');
assert.equal(await page.locator('[data-school-form],[data-lab-control],[data-lab-picture]').count(),0);
await page.locator('[role=tab][aria-selected=true]').press('Home');assert.equal(await page.locator('[role=tab][aria-selected=true]').textContent(),'Түсіну');await page.evaluate(()=>window.switchOwner());await page.locator('[data-school-tab="results"]').first().click();assert.equal(await page.locator('.school-result-list article').filter({hasText:'Әлі орындалмаған'}).count(),6);assert.deepEqual(errors,[]);mkdirSync(new URL('../test-output',import.meta.url),{recursive:true});await page.evaluate(()=>window.openUnit('bonding'));await page.screenshot({path:new URL('../test-output/school-'+width+'.png',import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'),fullPage:true});await ctx.close();}}finally{await browser.close();await new Promise(r=>server.close(r));}});
