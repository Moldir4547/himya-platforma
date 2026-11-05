import test from 'node:test';
import assert from 'node:assert/strict';
import {bridgeModuleView,CONTINUITY_LADDERS,continuityView,teacherHome} from '../teacher-journey.js';
import {SCHOOL_UNITS} from '../school-curriculum.js';
test('eight continuity routes have valid school anchors, explicit progression and source limits',()=>{
 assert.equal(CONTINUITY_LADDERS.length,8);
 assert.equal(new Set(CONTINUITY_LADDERS.map(t=>t.id)).size,8);
 for(const t of CONTINUITY_LADDERS){
  assert.equal(t.steps.length,4);
  for(const step of t.steps.filter(s=>Number.isInteger(s[0])))assert.ok(SCHOOL_UNITS.some(u=>u.grade===step[0]&&u.slug===step[1]),t.id);
  assert.match(t.lecture,/^\d+(?:–\d+)?$/);
  for(const k of ['change','shared','difference','gap'])assert.ok(t[k].length>25,k);
  assert.equal(t.steps[2][0],'bridge');assert.equal(t.steps[3][0],'uni');
 }
 const html=continuityView();
 assert.match(html,/8\.1\.4\.1/);assert.match(html,/тәуелсіз сарапшы растаған жоқ/);
 assert.match(html,/KazNEB/);
 assert.match(html,/Баешова/);assert.match(html,/барлық тарауы бойынша салыстыру әлі жасалмаған/);
 assert.match(teacherHome({}),/Білім баспалдағын ашу/);
 assert.doesNotMatch(teacherHome({}),/data-cb-topic/);
 assert.match(bridgeModuleView(),/Сабақтастық көпірі/);
 assert.match(bridgeModuleView(),/Нақты не күрделенеді/);
 assert.match(bridgeModuleView(),/Жаңа деңгейдің айырмасы/);
});
