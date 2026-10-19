import test from 'node:test';
import assert from 'node:assert/strict';
import {LABS} from '../guided-lab-data.js';
import {fresh,validRecord,elapsed,completeStep} from '../guided-lab-model.js';
for(const l of LABS)test(l.id+' sequence, tools, journal and clock restoration',()=>{
 let r=fresh(l);assert.throws(()=>completeStep(l,r,0),/missing_tools/);r.tools=[...l.tools];assert.throws(()=>completeStep(l,r,1),/step_order/);
 for(let i=0;i<l.steps.length;i++){r=completeStep(l,r,i);assert.equal(r.index,i+1);r.notes[i]='Қадамдағы құбылысты өз сөзімен бақылау '+i;}
 r.finished=true;r.conclusion='Ғылыми бақылауларға сүйеніп жасалған қорытынды.';r.elapsedMs=64250;r.runningSince=100;
 const restored=validRecord(l,JSON.parse(JSON.stringify(r)));assert.equal(restored.finished,true);assert.deepEqual(restored.notes,r.notes);assert.equal(restored.runningSince,null);assert.equal(restored.elapsedMs,64250);
 assert.equal(validRecord(l,{...r,notes:[]}).finished,false);assert.equal(elapsed({...r,elapsedMs:1000,runningSince:500},2500),3000);assert.equal(elapsed({...r,elapsedMs:1000,runningSince:null},2500),1000);
});
