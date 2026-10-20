import {knowledgeCardData} from '../university-control.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CONTROL_QUESTIONS as qs,CONTROL_TOPICS,CONTROL_DURATION_SECONDS,remainingSeconds,reviewControl} from '../university-control-data.js';
test('30 unique questions cover all seven requested topics with valid explanations',()=>{
 assert.equal(qs.length,30);assert.equal(new Set(qs.map(q=>q.id)).size,30);assert.equal(CONTROL_DURATION_SECONDS,1800);
 for(const [id,,count] of CONTROL_TOPICS)assert.equal(qs.filter(q=>q.topic===id).length,count);
 for(const q of qs){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<4);assert.ok(q.explanation.length>50);assert.ok(q.reference);}
 assert.deepEqual(JSON.parse(readFileSync(new URL('../university-control-bank.json',import.meta.url),'utf8')),qs);
});
test('deadline is absolute across reloads; blank answers are incorrect',()=>{
 const end='2026-10-20T01:30:00Z';
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:00:00Z')),1800);
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:20:00Z')),600);
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:31:00Z')),0);
 assert.equal(reviewControl(qs,qs.map(q=>q.correct_index)).filter(q=>q.correct).length,30);
 assert.equal(reviewControl(qs,Array(30).fill(-1)).filter(q=>q.correct).length,0);
});
test('calculation keys are independently checked',()=>{
 const answer=n=>qs[n-1].options[qs[n-1].correct_index];
 assert.equal(answer(6),'0,50 моль');assert.equal(answer(9),'49 г/моль-экв');assert.equal(answer(10),'98 г/моль-экв');
 assert.equal(answer(11),'12 г/моль-экв');assert.equal(answer(17),'65 г/моль');assert.equal(answer(20),'2,24 л');assert.equal(answer(22),'80%');
});

test('knowledge card isolates learners, orders labs and history, excludes navigation views',()=>{
 const state={user:{id:'admin',role:'admin'},items:[{id:'root',area:'university',path:'/universitet'},{id:'labs',area:'university',path:'/universitet/ozin-ozi-daiyndau'},{id:'10',parent_id:'labs',area:'university',title:'Зертхана 10',path:'/lab/10'},{id:'4',parent_id:'labs',area:'university',title:'Зертхана 4',path:'/lab/4'},{id:'card',area:'university',path:'/universitet/bilim-kartasy'}],analytics:{details:[{user_id:'a',item_id:'root'},{user_id:'a',item_id:'10'},{user_id:'b',item_id:'4',score:99},{user_id:'a',item_id:'4',updated_at:'2026-10-18'},{user_id:'a',item_id:'4',updated_at:'2026-10-20',progress:50},{user_id:'a',item_id:'card'}]}};
 const history=[{id:'old',user_id:'a',started_at:'2026-10-19',finished_at:'yes',score:12},{id:'other',user_id:'b',started_at:'2026-10-20',finished_at:'yes',score:30},{id:'new',user_id:'a',started_at:'2026-10-20',finished_at:'yes',score:24}];
 const d=knowledgeCardData(state,history,'a');
 assert.deepEqual(d.groups.labs.map(r=>r.item_id),['4','10']);assert.equal(d.groups.labs[0].progress,50);
 assert.equal(d.latest.score,24);assert.equal(d.best,24);assert.deepEqual(d.attempts.map(a=>a.id),['new','old']);assert.equal(d.groups.materials.length,0);
 state.user={id:'a',role:'university_student'};state.progress=state.analytics.details;
 assert.deepEqual(knowledgeCardData(state,history).groups.labs.map(r=>r.item_id),['4','10']);
});
