import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {readFileSync} from 'node:fs';import {chromium} from 'playwright';
const root=new URL('../',import.meta.url);
const fixture=`<!doctype html><html lang="kk"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/school.css"></head><body><main></main><script type="module">
import {createUniversityControl} from '/university-control.js';import {CONTROL_QUESTIONS} from '/university-control-data.js';
window.state={user:{id:'owner',role:'university_student'},progress:[],items:[{id:'control-item',title:'1-ағымдық бақылау',area:'university'}]};
window.rows=[];window.saves=0;window.offline=false;window.currentPath='/universitet/agymdyk-bakylau/1';
const host=document.querySelector('main');
const copy=x=>JSON.parse(JSON.stringify(x));
const store={
 async listCurrentControlAttempts(){return copy(rows.filter(a=>a.user_id===state.user.id).reverse());},
 async getAnalytics(){return{details:[],users:[]};},
 async startCurrentControl(restart){let a=rows.find(a=>a.user_id===state.user.id&&!a.finished_at);if(!a&&!restart)a=rows.filter(a=>a.user_id===state.user.id).at(-1);if(!a){a={id:crypto.randomUUID(),user_id:state.user.id,item_id:'control-item',started_at:new Date().toISOString(),deadline:new Date(Date.now()+1800000).toISOString(),answers:Array(30).fill(-1),questions:CONTROL_QUESTIONS,revision:0};rows.push(a);}return{...copy(a),server_now:new Date().toISOString()};},
 async saveCurrentControl(id,answers,revision,finish){saves++;if(offline){offline=false;throw Error('offline');}const a=rows.find(a=>a.id===id&&a.user_id===state.user.id);if(!a)throw Error('forbidden');const expired=Date.parse(a.deadline)<=Date.now();if(!a.finished_at){if(!expired){if(a.revision!==revision)throw Error('stale_attempt');a.answers=copy(answers);}a.revision++;if(finish||expired){a.finished_at=new Date().toISOString();a.score=a.answers.filter((v,i)=>v===a.questions[i].correct_index).length;}}const progress=a.finished_at?{item_id:a.item_id,score:a.score,max_score:30,quiz_answers:copy(a.answers),attempt_count:rows.filter(r=>r.finished_at).length}:null;return{attempt:{...copy(a),server_now:new Date().toISOString()},progress};}
};
let controls;
function mount(){host.innerHTML=controls.route(currentPath);controls.bind(host);}
window.remount=()=>{controls=createUniversityControl({store,state,render:mount,shell:x=>x});mount();};
window.openCard=()=>{currentPath='/universitet/bilim-kartasy';mount();};
window.switchOwner=()=>{state.user={id:'other',role:'university_student'};state.progress=[];currentPath='/universitet/agymdyk-bakylau/1';remount();};
window.preview=()=>{state.user={id:'admin',role:'admin'};currentPath='/universitet/agymdyk-bakylau/1';remount();};
window.expire=()=>{rows.filter(r=>!r.finished_at).forEach(r=>r.deadline=new Date(Date.now()-1000).toISOString());remount();};
remount();window.ready=true;
</script></body></html>`;
test('timed control desktop and phone: 30 choices, resume, save retry, review, card, timeout and isolation',async()=>{
 const assets=new Set(['university-control.js','university-control-data.js','school.css']);
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(name&&assets.has(name)?readFileSync(new URL(name,root)):fixture);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:950}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:'+server.address().port);
  await page.locator('[data-control-start]').waitFor();await page.locator('[data-control-start]').click();
  await page.locator('[data-control-clock]').waitFor();assert.equal(await page.locator('fieldset').count(),30);
  assert.equal(await page.locator('[data-control-answer]').count(),120);
  await page.locator('[data-control-answer="0"][value="0"]').check();
  await page.waitForFunction(()=>rows[0].revision===1);
  await page.evaluate(()=>remount());await page.locator('[data-control-answer="0"][value="0"]:checked').waitFor();
  assert.match(await page.locator('[data-control-clock]').textContent(),/^(29:|30:00)/);
  await page.evaluate(()=>offline=true);await page.locator('[data-control-answer="1"][value="2"]').check();
  await page.getByRole('alert').filter({hasText:'Сақталмады'}).waitFor();
  await page.locator('[data-control-save]').click();await page.waitForFunction(()=>rows[0].answers[1]===2);
  await page.locator('[data-control-form] button[type="submit"]').click();
  await page.getByRole('heading',{name:'Нәтиже: 1 / 30',exact:true}).waitFor();
  assert.ok(await page.getByText('Дұрыс жауап:',{exact:false}).count()>=30);
  await page.evaluate(()=>openCard());await page.getByText('Соңғы ұпай, жауаптар және алдыңғы талпыныстар сақталады.',{exact:true}).waitFor();
  assert.equal(await page.evaluate(()=>state.progress[0].quiz_answers.length),30);
  await page.evaluate(()=>{currentPath='/universitet/agymdyk-bakylau/1';remount();});await page.locator('[data-control-restart]').waitFor();await page.locator('[data-control-restart]').click();
  await page.locator('[data-control-clock]').waitFor();await page.evaluate(()=>expire());
  await page.getByRole('heading',{name:'Нәтиже: 0 / 30',exact:true}).waitFor();
  await page.evaluate(()=>switchOwner());await page.locator('[data-control-start]').waitFor();
  assert.equal(await page.getByRole('heading',{name:/Нәтиже:/}).count(),0);
  await page.evaluate(()=>preview());await page.locator('[data-control-start]').click();await page.locator('[data-control-clock]').waitFor();
  const before=await page.evaluate(()=>saves);await page.locator('[data-control-form] button[type="submit"]').click();
  await page.getByRole('heading',{name:'Нәтиже: 0 / 30',exact:true}).waitFor();assert.equal(await page.evaluate(()=>saves),before);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);assert.deepEqual(errors,[]);
  await context.close();
 }}finally{await browser.close();await new Promise(r=>server.close(r));}
});
