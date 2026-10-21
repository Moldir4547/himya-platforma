import test from 'node:test';import assert from 'node:assert/strict';import {LABS8} from '../guided-lab-8-data.js';import {SCHOOL_UNITS} from '../school-curriculum.js';import {scene8} from '../guided-lab-8-scene.js';import {fresh,completeStep,validRecord} from '../guided-lab-model.js';
test('eleven grade-eight author scenarios map to the grade curriculum and keep bounded step journals',()=>{
assert.equal(LABS8.length,11);assert.equal(new Set(LABS8.map(l=>l.id)).size,11);
for(const l of LABS8){assert.ok(SCHOOL_UNITS.some(u=>u.grade===8&&u.slug===l.topic));assert.equal(l.grade,8);assert.match(l.source,/авторлық/);assert.ok(l.tools.length>=4);assert.ok(l.steps.length>=5);let r=fresh(l);assert.throws(()=>completeStep(l,r,0),/missing_tools/);r.tools=[...l.tools];const before=scene8(l,r,null);
for(let i=0;i<l.steps.length;i++){assert.throws(()=>completeStep(l,r,i+1),/step_order/);r=completeStep(l,r,i);r.notes[i]='Мен құбылысты бақылап, нәтижесін өз сөзіммен жаздым.';}
assert.notEqual(scene8(l,r,null),before);r.conclusion='Бақылауға сүйенген ғылыми қорытынды жасалды.';r.finished=true;assert.equal(validRecord(l,r).finished,true);
}
const metals=LABS8.find(l=>l.id==='g8-metals');assert.doesNotMatch(scene8(metals,{...fresh(metals),index:4},null),/M270 136V95H520V250/);
const mass=LABS8.find(l=>l.id==='g8-mass'),r={...fresh(mass),index:5};assert.match(scene8(mass,r,null),/80,00 г/);
const carbonate=LABS8.find(l=>l.id==='g8-carbonate');assert.match(scene8(carbonate,{...fresh(carbonate),index:4},null),/лайланды/);assert.match(scene8(carbonate,{...fresh(carbonate),index:5},null),/мөлдірленді/);
});
