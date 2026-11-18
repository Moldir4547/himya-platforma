import {test} from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {readFileSync} from 'node:fs';
const {chromium}=await import(process.env.WS_QA_PLAYWRIGHT||'playwright');
const fixture=`<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/school.css"><main></main><script type="module">
import {quest,handIn,inbox} from '/worksheet-quests.js';import {bindDelivery} from '/worksheet-delivery.js';import {SCHOOL_UNITS} from '/school-curriculum.js';
const learner={id:'00000000-0000-4000-8000-000000000001',role:'student'},teacher={id:'00000000-0000-4000-8000-000000000002',participant_type:'teacher'};
const u=SCHOOL_UNITS[0],state={user:learner};let pair=false,photo=null;const id='00000000-0000-4000-8000-000000000003';
const store={validSession:async()=>({user:state.user,access_token:'mock'}),headers:()=>({}),request:async(p,o)=>{
 if(p.endsWith('ws_recipient'))return pair?[{id:teacher.id,name:'Химия ұстазы'}]:[];
 if(p.endsWith('ws_pair')){pair=true;return;}if(p.endsWith('ws_send')){if(window.failOnce){window.failOnce=false;throw Error('offline');}photo=JSON.parse(o.body).p_jpeg;return id;}
 if(p.endsWith('ws_code'))return id;
 if(p.includes('select=jpeg'))return [{jpeg:photo}];
 if(p.includes('learner=eq.'))return photo?[{sent_at:new Date().toISOString()}]:[];
 return photo?[{id,learner_name:'Сынақ оқушысы',grade:7,slug:u.slug,sent_at:new Date().toISOString()}]:[];
}};
const root=document.querySelector('main');
function view(){root.innerHTML=state.user===learner?quest(u,['','Заттарды тап'])+handIn(u,learner):inbox(teacher);bindDelivery(root,{state,store,units:SCHOOL_UNITS});}window.openInbox=()=>{state.user=teacher;view()};view();
</script>`;
test('mobile and desktop: printable quest, private photo preview, retry and teacher receipt',async()=>{
 const server=http.createServer((req,res)=>{const name=req.url.slice(1);if(!name){res.setHeader('content-type','text/html; charset=utf-8');return res.end(fixture);}if(!['worksheet-quests.js','worksheet-delivery.js','school-explanations.js','school-curriculum.js','school.css'].includes(name)){res.writeHead(404);return res.end();}
 res.setHeader('content-type',name.endsWith('css')?'text/css':'application/javascript');res.end(readFileSync(new URL('../'+name,import.meta.url)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{browser=await chromium.launch({...(process.env.WS_QA_CHROME?{executablePath:process.env.WS_QA_CHROME}:{})});
 for(const width of [375,1200]){const page=await browser.newPage({viewport:{width,height:840}});await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-code]:visible').waitFor();
 assert.equal(await page.locator('[data-send]').isDisabled(),true);
 await page.locator('[data-code]').fill('00000000-0000-4000-8000-000000000003');await page.locator('[data-connect]').click();await page.getByText(/Алушы: Химия ұстазы/).waitFor();
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=200;c.height=120;const x=c.getContext('2d');x.fillText('2 + 2',30,30);return c.toDataURL().split(',')[1];});await page.locator('[data-gallery]').setInputFiles({name:'work.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});await page.locator('[data-preview]:visible').waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 await page.evaluate(()=>{window.failOnce=true;});await page.locator('[data-send]').click();await page.getByText(/Қабылданғаны расталмады/).waitFor();await page.locator('[data-send]').click();await page.getByText(/^Қабылданды/).waitFor();
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('.cq-paper h2').isVisible(),true);assert.equal(await page.locator('[data-cq-send]').isVisible(),false);await page.emulateMedia({media:'screen'});
 await page.evaluate(()=>window.openInbox());await page.getByText('Сынақ оқушысы').waitFor();await page.getByRole('button',{name:'Фотосын ашу'}).click();assert.match(await page.locator('.cq-submission img').getAttribute('src'),/^data:image\/jpeg;base64,/);await page.close();}
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
});
