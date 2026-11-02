import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {TEACHING_TRACKS,schoolContentAudit,planKey,sanitizePlan,teacherHome,createTeacherJourney,JOURNEY_PATH} from '../teacher-journey.js';
test('five teacher tracks connect real school lessons with university depth, explanations and classroom evidence',()=>{
 assert.equal(TEACHING_TRACKS.length,5);
 for(const t of TEACHING_TRACKS){
  assert.ok(SCHOOL_UNITS.some(u=>u.slug===t.schoolSlug&&u.grade===t.grade));
  for(const key of ['school','university','teach','evidence','why','boundary'])assert.ok(t[key].length>40,t.id+' '+key);
  assert.ok(t.answer>=0&&t.answer<t.options.length);
 }
 assert.equal(TEACHING_TRACKS.find(t=>t.id==='equivalent').options[1],98/2+' г/моль');
 assert.match(TEACHING_TRACKS.find(t=>t.id==='solutions').why,/100 г/);
 assert.match(TEACHING_TRACKS.find(t=>t.id==='redox').why,/Fe²⁺ → Fe³⁺ \+ e⁻/);
 const home=teacherHome({user:null});
 assert.match(home,/Мектептен — ЖОО-ға/);assert.match(home,/Химияны бірге тереңдетейік/);
 assert.ok(home.includes(JOURNEY_PATH));assert.equal((home.match(/class="direction-card /g)||[]).length,3);
});
test('coverage audit uses real grade/topic files and excludes unpublished, wrong grade, orphan and unrelated documents',()=>{
 const state={items:[
  {id:'s',path:'/mektep',area:'school',is_published:true},
  {id:'g7',parent_id:'s',path:'/mektep/teoriya/7-synyp',area:'school',is_published:true},
  {id:'g8',parent_id:'s',path:'/mektep/teoriya/8-synyp',area:'school',is_published:true},
  {id:'hidden',parent_id:'g8',path:'/hidden',is_published:false}
 ],allResources:[
  {id:'slide',item_id:'g8',filename:'Химиялық байланыс.pptx'},
  {id:'sheet',item_id:'g8',filename:'Жұмыс парағы. Химиялық байланыс.pdf'},
  {id:'wrong-grade',item_id:'g7',filename:'Химиялық байланыс.pptx'},
  {id:'hidden-file',item_id:'g8',filename:'Химиялық байланыс.pptx',is_published:false},
  {id:'hidden-item',item_id:'hidden',filename:'Химиялық байланыс.pptx'},
  {id:'orphan',item_id:'missing',filename:'Химиялық байланыс.pptx'},
  {id:'book',item_id:'g8',filename:'Химия 8 оқулық.pdf'}
 ]};
 const before=JSON.stringify(state),rows=schoolContentAudit(state);
 assert.equal(rows.length,71);
 const bond=rows.find(r=>r.slug==='bonding');assert.equal(bond.slides,1);assert.equal(bond.worksheets,1);
 assert.equal(rows.find(r=>r.slug==='oxides').slides,0);
 assert.equal(JSON.stringify(state),before);
});
test('browser drafts have bounded strings and separate keys per account and topic; guest view exposes no plans',()=>{
 assert.notEqual(planKey('a','bond'),planKey('b','bond'));
 assert.notEqual(planKey('a','bond'),planKey('a','atom'));
 const plan=sanitizePlan({goal:'x'.repeat(10000),connection:12,criteria:[true,'true',false,1],reflection:'r'.repeat(2000),role:'admin'});
 assert.equal(plan.goal.length,2400);assert.equal(plan.connection,'');assert.equal(plan.reflection.length,1200);
 assert.deepEqual(plan.criteria,[true,false,false,false]);assert.equal(plan.role,undefined);
 const page=createTeacherJourney({state:{user:null},render(){}}).view();
 assert.doesNotMatch(page,/data-tj-plan|data-tj-save/);assert.ok(page.includes(encodeURIComponent(JOURNEY_PATH)));
});
