import {test} from 'node:test';
import assert from 'node:assert/strict';
import {UNIVERSITY_MISSIONS,gradeUniversity} from '../chem-university-missions.js';

test('four book-grounded university routes contain five multi-part challenges each',()=>{
 assert.equal(Object.keys(UNIVERSITY_MISSIONS).length,4);
 for(const game of Object.values(UNIVERSITY_MISSIONS)){
  assert.equal(game.tasks.length,5);
  for(const task of game.tasks){
   assert.ok(task.fields.length>=2);
   assert.equal(task.source[1]-task.source[2],3);
   const correct=task.fields.map(f=>String(f.value));
   assert.ok(gradeUniversity(task,correct).every(Boolean),task.title);
   assert.equal(gradeUniversity(task,correct.map((v,i)=>i===0?'':v)),null);
   const incorrect=correct.map((v,i)=>i===0?String(Number(v)+(task.fields[0].choices?1:10)):v);
   assert.equal(gradeUniversity(task,incorrect)?.[0]??false,false);
  }
 }
});
test('numerical answers handle commas, signs and precision without accepting blanks',()=>{
 const sol=UNIVERSITY_MISSIONS['uni-solutions'].tasks[1];
 assert.deepEqual(gradeUniversity(sol,['27,0','173']),[true,true]);
 const redox=UNIVERSITY_MISSIONS['uni-redox'].tasks[3];
 assert.deepEqual(gradeUniversity(redox,['−1','1','1']),[true,true,true]);
 assert.equal(gradeUniversity(redox,['','1','1']),null);
});
