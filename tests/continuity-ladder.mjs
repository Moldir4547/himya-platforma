import {BOOK_READINGS,bookReading,readingId} from '../bridge-book.js';
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

test('microlearning provides verified print/PDF references and unique remediation targets',()=>{
 assert.deepEqual(Object.keys(BOOK_READINGS),CONTINUITY_LADDERS.map(t=>t.id));
 const expected={bond:[84,81],atom:[49,46],equivalent:[20,17],solutions:[142,139],redox:[195,192],periodic:[70,67],equilibrium:[129,126],acidbase:[164,161]};
 for(const t of CONTINUITY_LADDERS){
  const r=BOOK_READINGS[t.id];assert.equal(r.notes.length,4);
  assert.deepEqual(r.refs[0].slice(1),expected[t.id]);
  for(const [title,print,pdf] of r.refs){assert.ok(title.length>5);assert.ok(print>0&&pdf>0);assert.ok(bookReading(t.id,3).includes('PDF: '+pdf+'-бет'));}
  for(let i=0;i<4;i++){assert.ok(r.notes[i].length<650);assert.equal(readingId(t.id,i),'cb-reading-'+t.id+'-'+i);}
 }
 const html=continuityView();
 for(let i=0;i<4;i++)assert.ok(html.includes('id="'+readingId('bond',i)+'"'));
 assert.match(html,/Пірәлиев/);assert.match(html,/Кітап: 84-бет/);assert.match(html,/PDF: 81-бет/);
});
