import test from 'node:test';
import assert from 'node:assert/strict';
import {PRACTICE_TASKS,CURRICULUM_REVIEW,SOURCE_DOCUMENTS,gradePractice,numericAnswer,sanitizeRun,practiceResult,practiceKey,curriculumReviewView,REVIEW_VERSION} from '../continuity-assessment.js';
import {CONTINUITY_LADDERS} from '../teacher-journey.js';
test('32 staged tasks grade correct, wrong and incomplete responses across eight documented topics',()=>{
 assert.equal(Object.keys(PRACTICE_TASKS).length,8);
 for(const t of CONTINUITY_LADDERS){
  const qs=PRACTICE_TASKS[t.id];assert.equal(qs.length,4);
  assert.deepEqual(qs.map(q=>q.kind),['choice','match','model','number']);
  const values=[qs[0].answer,qs[1].answers,{scenario:1,option:qs[2].cases[1].answer},String(qs[3].answer).replace('.',',')];
  qs.forEach((q,i)=>assert.deepEqual(gradePractice(q,values[i]),{valid:true,correct:true},t.id+' '+i));
  assert.equal(gradePractice(qs[0],(qs[0].answer+1)%qs[0].options.length).correct,false);
  assert.equal(gradePractice(qs[1],[-1,-1]).valid,false);
  assert.equal(gradePractice(qs[2],{scenario:99,option:0}).valid,false);
  assert.equal(gradePractice(qs[3],'').valid,false);
  assert.equal(gradePractice(qs[3],String(qs[3].answer+10)).correct,false);
  const complete=sanitizeRun(t.id,{answers:values,index:4,finished:true});
  assert.equal(practiceResult(t.id,complete).score,4);
  assert.deepEqual(practiceResult(t.id,complete).missed,[]);
  for(const [g,code] of CURRICULUM_REVIEW[t.id].goals){assert.ok(SOURCE_DOCUMENTS[g]);assert.ok(code.startsWith(g+'.'));}
  assert.match(curriculumReviewView(t),/ҚҰЖАТТАР БОЙЫНША БАҒАЛАУ/);
 }
});
test('numeric input, incomplete runs and account keys cannot silently fabricate completion',()=>{
 for(const s of ['',' ','NaN','Infinity','1e999','0x10','4 г'])assert.equal(numericAnswer(s),null,s);
 assert.equal(numericAnswer(' 1,461 '),1.461);assert.equal(numericAnswer('1e-3'),.001);
 const empty=sanitizeRun('bond',{answers:[99,[],{},'2'],index:4,finished:true,attempt:-1,best:99});
 assert.equal(empty.answers.length,0);assert.equal(empty.finished,false);assert.equal(empty.index,0);assert.equal(empty.attempt,1);assert.equal(empty.best,4);
 assert.notEqual(practiceKey('alice','bond'),practiceKey('bob','bond'));
 assert.equal(sanitizeRun('unknown'),null);
 assert.equal(sanitizeRun('bond',null).version,REVIEW_VERSION);
 assert.match(CURRICULUM_REVIEW.solutions.verdict,/8-сыныпта/);
 assert.match(CURRICULUM_REVIEW.periodic.depth,/нақтылануы/);
});
