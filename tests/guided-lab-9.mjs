import test from 'node:test';import assert from 'node:assert/strict';import {LABS9} from '../guided-lab-9-data.js';import {SCHOOL_UNITS} from '../school-curriculum.js';import {scene9} from '../guided-lab-9-scene.js';import {fresh,completeStep,validRecord} from '../guided-lab-model.js';
test('grade nine catalog, steps and persisted reports map to the curriculum',()=>{
 assert.equal(LABS9.length,13);assert.equal(new Set(LABS9.map(l=>l.id)).size,13);
 for(const l of LABS9){assert.ok(SCHOOL_UNITS.some(u=>u.grade===9&&u.slug===l.topic));assert.equal(l.grade,9);assert.match(l.source,/авторлық/);
 let r=fresh(l);assert.throws(()=>completeStep(l,r,0),/missing_tools/);assert.match(scene9(l,r,null),/0 \/ /);
 r.tools=[...l.tools];const initial=scene9(l,r,null);
 for(let n=0;n<l.steps.length;n++){assert.throws(()=>completeStep(l,r,n+1),/step_order/);r=completeStep(l,r,n);r.notes[n]='Бақылауды өзім сипаттап, салыстыру үлгісімен тексердім.';}
 assert.notEqual(scene9(l,r,null),initial);r.finished=true;r.conclusion='Бақылауларға сүйеніп ғылыми қорытынды жасадым.';assert.equal(validRecord(l,r).finished,true);
 assert.equal(validRecord(l,{...r,notes:[]}).finished,false);
 }
});
test('chemical scenes distinguish controls, stages and necessary reagent choices',()=>{
 const at=(id,n)=>{const l=LABS9.find(x=>x.id==='g9-'+id);return scene9(l,{...fresh(l),tools:l.tools,index:n},null);};
 assert.doesNotMatch(at('halides',3),/fill="#eed865"/);assert.match(at('halides',4),/fill="#eed865"/);
 assert.match(LABS9.find(l=>l.kind==='halides').steps[2].label,/HNO₃/);
 assert.match(at('cations',4),/#9ab287/);assert.doesNotMatch(at('cations',5),/#9ab287/);
 assert.match(at('aluminium',2),/fill="#e9eee8"/);assert.equal((at('aluminium',5).match(/fill="#e9eee8"/g)||[]).length,1);
 assert.match(at('rate',5),/соңғы мөлшері бірдей/);assert.match(at('catalyst',5),/O₂ мөлшері бірдей/);
 assert.match(at('conductivity',3),/Ток өтеді/);assert.match(at('ammonium',4),/fill="#658cca"/);
 assert.match(LABS9.find(l=>l.kind==='sulfate').steps[2].label,/газ бөлінуі тоқтағанша/);
 assert.match(LABS9.find(l=>l.kind==='silicate').extra,/шартты жазылуы/);
});