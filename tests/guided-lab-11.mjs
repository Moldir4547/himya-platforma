import test from 'node:test';import assert from 'node:assert/strict';import {LABS11} from '../guided-lab-11-data.js';import {SCHOOL_UNITS} from '../school-curriculum.js';import {scene11,readings11} from '../guided-lab-11-scene.js';import {fresh,completeStep,validRecord} from '../guided-lab-model.js';
const lab=k=>LABS11.find(l=>l.kind===k),at=(k,n)=>scene11(lab(k),{...fresh(lab(k)),tools:lab(k).tools,index:n},null);
test('six focused grade-eleven inorganic practicals preserve bounded personal journals',()=>{
 assert.equal(LABS11.length,6);assert.equal(new Set(LABS11.map(l=>l.id)).size,6);
 const topics=new Set(['acid-base-ph','buffers','titration','transition-complexes','electroplating','group-fourteen']);
 for(const l of LABS11){assert.equal(l.grade,11);assert.ok(topics.has(l.topic));assert.ok(SCHOOL_UNITS.some(u=>u.grade===11&&u.slug===l.topic));assert.match(l.source,/авторлық/);let r=fresh(l);assert.throws(()=>completeStep(l,r,0),/missing_tools/);r.tools=[...l.tools];const initial=scene11(l,r,null);
 for(let i=0;i<l.steps.length;i++){assert.throws(()=>completeStep(l,r,i+1),/step_order/);r=completeStep(l,r,i);r.notes[i]='Бақылау мен құрал көрсеткішін өз сөзіммен сипаттап жаздым.';}
 r.finished=true;r.conclusion='Бақылау мен есепке негізделген ғылыми қорытынды.';assert.equal(validRecord(l,r).finished,true);assert.equal(validRecord(l,{...r,notes:[]}).finished,false);assert.notEqual(scene11(l,r,null),initial);
 }
});
test('inorganic pH, phosphate buffer, titre and plating measurements obey chemistry',()=>{
 const start=readings11(lab('ph'),2),middle=readings11(lab('ph'),4),end=readings11(lab('ph'),6);
 assert.deepEqual([start.acidPH,start.basePH,end.acidPH,end.basePH],[2,12,3,11]);assert.equal(middle.acidPH,3);assert.equal(middle.basePH,12);assert.equal(end.finalM,.001);
 const b=readings11(lab('buffer'),6);assert.ok(b.waterPH>4&&b.waterPH<4.01);assert.ok(b.bufferPH>7.20&&b.bufferPH<7.21);assert.ok(Math.abs(b.bufferPH-7.21)<.01);assert.equal(readings11(lab('buffer'),2).waterPH,7);
 const t=readings11(lab('titration'),6);assert.ok(Math.abs(t.acidM-.1002)<1e-12);assert.ok(t.pH>9.99&&t.pH<10.01);assert.ok(t.volume>lab('titration').measurements.equivalenceMl);
 const p=readings11(lab('plating'),6);assert.ok(p.delta>.0197&&p.delta<.0199);assert.equal(Number((p.spoonG+p.anodeG).toFixed(6)),15);assert.equal(p.spoonG.toFixed(3),'10.020');
 const c=lab('complex').measurements;assert.equal(c.ammoniaLigands+c.waterLigands,c.coordination);assert.equal(c.coordination,6);
});
test('reaction stages distinguish precipitate, excess ligand, endpoint and plated article',()=>{
 assert.doesNotMatch(at('complex',3),/#365eaa/);assert.match(at('complex',4),/#365eaa/);assert.match(at('complex',4),/6 лиганд/);
 assert.doesNotMatch(at('titration',4),/#e8c9d8/);assert.match(at('titration',5),/#e8c9d8/);
 assert.doesNotMatch(at('plating',4),/cg-bubble/);assert.match(at('plating',5),/10,020/);assert.match(at('plating',5),/4,980/);assert.match(at('plating',5),/Ток өшірілді/);
 assert.doesNotMatch(at('silicate',3),/Гель — гидратталған/);assert.match(at('silicate',4),/Гель — гидратталған/);
});