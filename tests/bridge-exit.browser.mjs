import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
const {chromium}=await import(process.env.EXIT_QA_PLAYWRIGHT||'playwright');
const assets=['bridge-exit.js','bridge-path.js','equivalent-path.js','bond-lab.js','bond-models.js','bond-practice.js','bridge-path.css'];
const pageHtml=`<meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1"><link rel=stylesheet href="/bridge-path.css"><main></main><script type=module>
import {bridgeLessonView,createBridgePath} from '/bridge-path.js';import {equivalentLessonView,createEquivalentPath} from '/equivalent-path.js';import {bindBridgeExit,lessons} from '/bridge-exit.js';
const l=location.pathname.slice(1),staff=l==='teacher',state={user:{id:'demo',participant_type:staff?'teacher':l==='bond'?'school_student':'university_student'},progress:[]};const root=document.querySelector('main'),store={validSession:async()=>({user:state.user,access_token:'demo'}),headers:()=>({}),request:async(p,opt)=>{let data=JSON.parse(sessionStorage.getItem('answer')||'null');if(p.includes('bridge_exits?'))return data&&p.includes('lesson=eq.'+encodeURIComponent(data.lesson)+'&')?[data]:[];
 if(p.endsWith('_stats'))return [{responses:1,step:2,helpful:'lab',difficulty:'first'}];if(p.endsWith('_inbox'))return [{...data,id:'1',evidence:'Менің дәлелім',audience:'school_student'}];if(p.endsWith('_review')){window.reviewed=true;return;}
 const a=JSON.parse(opt.body);if(window.offline){window.offline=false;throw Error('offline');}data={lesson:a.p_lesson,id:'1',revision:a.p_revision+1,step:a.p_step,evidence:a.p_evidence,helpful:a.p_helpful,difficulty:a.p_difficulty,note:a.p_note};sessionStorage.setItem('answer',JSON.stringify(data));return data;}};
 const units=[{slug:'bonding',grade:8,title:'Химиялық байланыс',topics:['Ион','Байланыс','Кристалл']}];
 if(l==='school'||l.startsWith('universitet/')){
 const lec='/universitet/teoriya',lab='/universitet/ozin-ozi-daiyndau/lab';state.items=[{id:'lecture-course',path:lec,area:'university'},{id:'lab-id',title:'Зертхана',path:lab,area:'university'}];state.resources={'lecture-course':[{id:'f1',filename:'Дәріс 1'},{id:'f2',filename:'Дәріс 2'}]};
 if(l==='school'){state.user.participant_type='school_student';root.innerHTML='<div data-school-unit="bonding"><header class="school-hero"></header><button id="school-tab-results" aria-selected="false">Нәтиже</button><section id="school-panel"></section></div>';root.querySelector('#school-tab-results').onclick=ev=>{ev.target.setAttribute('aria-selected','true');bindBridgeExit(root,{store,state,units});};}
 else if('/'+l===lec)root.innerHTML=['f1','f2'].map(id=>'<article class="resource-card"><button data-open-resource="'+id+'">Ашу</button></article>').join('');
 else root.innerHTML='<div class="lesson-main"><header class="lesson-head">Зертхана</header></div>';
 bindBridgeExit(root,{store,state,units});}
 else if(staff){root.innerHTML='<div class=teacher-hub><header class=teacher-head></header></div>';bindBridgeExit(root,{store,state});}
 else{const view=l==='bond'?bridgeLessonView:equivalentLessonView;root.innerHTML=view({theory:lessons[l].topics.map(([title,id])=>'<div id="'+id+'">'+title+'</div>').join(''),test:'',materials:'',progress:{}});bindBridgeExit(root,{store,state});(l==='bond'?createBridgePath:createEquivalentPath)({state,store}).bind(root,{id:'lesson'});}
</script>`;
test('both real lesson result panels: mobile entry, return to matching theory, retry, restore and teacher review',async()=>{
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname.slice(1);if(assets.includes(p)){res.setHeader('content-type',p.endsWith('css')?'text/css':'application/javascript');return res.end(readFileSync(new URL('../'+p,import.meta.url)));}res.setHeader('content-type','text/html');res.end(pageHtml);});await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
 try{b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});const base='http://127.0.0.1:'+server.address().port;
 for(const [lesson,count,width,anchor] of [['bond',3,360,'bond-ionic'],['equivalent',4,1280,'eqv-moles']]){const p=await b.newPage({viewport:{width,height:850}});await p.goto(base+'/'+lesson+'#feedback');const form=p.locator('[data-exit-form]');await form.waitFor();assert.equal(await form.locator('[type=radio]').count(),count);
 await form.locator('select[name=difficulty]').selectOption('first');await form.locator('[data-exit-link] a').click();assert.equal(await p.locator('#'+anchor).isVisible(),true);await p.getByRole('tab',{name:/Нәтиже/}).click();
 await form.locator('[value="2"]').check();await form.locator('[name=evidence]').fill('Бір дәлел <мән>');await form.locator('[name=helpful]').selectOption('lab');await p.evaluate(()=>{window.offline=true});await form.locator('[type=submit]').click();await p.getByText(/Жауабыңыз осы бетте қалды/).waitFor();await form.locator('[type=submit]').click();await p.getByText(/Жауабыңыз сақталды/).waitFor();
 await p.reload();await p.locator('[data-exit-summary]').getByText(/Бір дәлел <мән>/).waitFor();assert.equal(await p.evaluate(()=>document.querySelector('[data-exit]').getBoundingClientRect().width<=innerWidth),true);await p.close();}
 for(const [path,key,count] of [['school','school:bonding',3],['universitet/teoriya','lecture:f2',4],['universitet/ozin-ozi-daiyndau/lab','uni:lab-id',4]]){
 const p=await b.newPage({viewport:{width:360,height:820}});await p.goto(base+'/'+path);
 const open=()=>path==='school'?p.locator('[data-exit-shortcut]').click():p.locator('[data-reflection-key="'+key+'"] summary').click();await open();
 const form=p.locator('[data-exit="'+key+'"] form');assert.equal(await form.locator('[type=radio]').count(),count);await form.locator('[data-thought=bond]').click();await form.locator('[data-prompt]').getByText(count===3?/көшедегі/:/практикада/).waitFor();
 await form.locator('[name=evidence]').fill('Мені ойландырғаны');await form.locator('[data-thought=unknown]').click();assert.equal(await form.locator('[name=evidence]').inputValue(),'Мені ойландырғаны');await form.locator('[value="2"]').check();await form.locator('[name=helpful]').selectOption('example');await form.locator('[name=difficulty]').selectOption('clear');await form.locator('[type=submit]').click();await p.getByText(/Жауабыңыз сақталды/).waitFor();
 assert.equal(await p.evaluate(()=>JSON.parse(sessionStorage.answer).lesson),key);await p.reload();await open();await p.locator('[data-exit-summary]').getByText(/Мені ойландырғаны/).waitFor();assert.equal(await form.locator('[data-thought=unknown]').getAttribute('aria-pressed'),'true');if(path==='universitet/teoriya'){await p.locator('[data-reflection-key="lecture:f1"] summary').click();assert.equal(await p.locator('[data-exit="lecture:f1"] textarea[name=evidence]').inputValue(),'');}await p.close();}
 const p=await b.newPage();await p.goto(base+'/teacher');await p.locator('[data-exit-report] summary').click();await p.getByText('1 қатысушы жауап берді').waitFor();await p.locator('.ex-response select').selectOption('partial');await p.getByText('Белгіні сақтау').click();await p.getByText('Белгі сақталды.').waitFor();assert.equal(await p.evaluate(()=>window.reviewed),true);
 }finally{await b?.close();await new Promise(r=>server.close(r));}
});
