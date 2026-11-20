import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
const {chromium}=await import(process.env.EXIT_QA_PLAYWRIGHT||'playwright');
const assets=['bridge-exit.js','bridge-path.js','equivalent-path.js','bond-lab.js','bond-models.js','bond-practice.js','bridge-path.css'];
const pageHtml=`<meta charset=utf-8><meta name="viewport" content="width=device-width,initial-scale=1"><link rel=stylesheet href="/bridge-path.css"><main></main><script type=module>
import {bridgeLessonView,createBridgePath} from '/bridge-path.js';import {equivalentLessonView,createEquivalentPath} from '/equivalent-path.js';import {bindBridgeExit,lessons} from '/bridge-exit.js';
const l=location.pathname.slice(1),staff=l==='teacher',state={user:{id:'demo',participant_type:staff?'teacher':l==='bond'?'school_student':'university_student'},progress:[]};const root=document.querySelector('main'),store={validSession:async()=>({user:state.user,access_token:'demo'}),headers:()=>({}),request:async(p,opt)=>{let data=JSON.parse(sessionStorage.getItem('answer')||'null');if(p.includes('bridge_exits?'))return data?[data]:[];
 if(p.endsWith('_stats'))return [{responses:1,step:2,helpful:'lab',difficulty:'first'}];if(p.endsWith('_inbox'))return [{...data,id:'1',evidence:'Менің дәлелім',audience:'school_student'}];if(p.endsWith('_review')){window.reviewed=true;return;}
 const a=JSON.parse(opt.body);if(window.offline){window.offline=false;throw Error('offline');}data={id:'1',revision:a.p_revision+1,step:a.p_step,evidence:a.p_evidence,helpful:a.p_helpful,difficulty:a.p_difficulty,note:a.p_note};sessionStorage.setItem('answer',JSON.stringify(data));return data;}};
 if(staff){root.innerHTML='<div class=teacher-hub><header class=teacher-head></header></div>';bindBridgeExit(root,{store,state});}
 else{const view=l==='bond'?bridgeLessonView:equivalentLessonView;root.innerHTML=view({theory:lessons[l].topics.map(([title,id])=>'<div id="'+id+'">'+title+'</div>').join(''),test:'',materials:'',progress:{}});bindBridgeExit(root,{store,state});(l==='bond'?createBridgePath:createEquivalentPath)({state,store}).bind(root,{id:'lesson'});}
</script>`;
test('both real lesson result panels: mobile entry, return to matching theory, retry, restore and teacher review',async()=>{
 const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname.slice(1);if(assets.includes(p)){res.setHeader('content-type',p.endsWith('css')?'text/css':'application/javascript');return res.end(readFileSync(new URL('../'+p,import.meta.url)));}res.setHeader('content-type','text/html');res.end(pageHtml);});await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
 try{b=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});const base='http://127.0.0.1:'+server.address().port;
 for(const [lesson,count,width,anchor] of [['bond',3,360,'bond-ionic'],['equivalent',4,1280,'eqv-moles']]){const p=await b.newPage({viewport:{width,height:850}});await p.goto(base+'/'+lesson+'#feedback');const form=p.locator('[data-exit-form]');await form.waitFor();assert.equal(await form.locator('[type=radio]').count(),count);
 await form.locator('select[name=difficulty]').selectOption('first');await form.locator('[data-exit-link] a').click();assert.equal(await p.locator('#'+anchor).isVisible(),true);await p.getByRole('tab',{name:/Нәтиже/}).click();
 await form.locator('[value="2"]').check();await form.locator('[name=evidence]').fill('Бір дәлел <мән>');await form.locator('[name=helpful]').selectOption('lab');await p.evaluate(()=>{window.offline=true});await form.locator('[type=submit]').click();await p.getByText(/Жауабыңыз осы бетте қалды/).waitFor();await form.locator('[type=submit]').click();await p.getByText(/Жауабыңыз сақталды/).waitFor();
 await p.reload();await p.locator('[data-exit-summary]').getByText(/Бір дәлел <мән>/).waitFor();assert.equal(await p.evaluate(()=>document.querySelector('[data-exit]').getBoundingClientRect().width<=innerWidth),true);await p.close();}
 const p=await b.newPage();await p.goto(base+'/teacher');await p.locator('[data-exit-report] summary').click();await p.getByText('1 қатысушы жауап берді').waitFor();await p.locator('.ex-response select').selectOption('partial');await p.getByText('Белгіні сақтау').click();await p.getByText('Белгі сақталды.').waitFor();assert.equal(await p.evaluate(()=>window.reviewed),true);
 }finally{await b?.close();await new Promise(r=>server.close(r));}
});
