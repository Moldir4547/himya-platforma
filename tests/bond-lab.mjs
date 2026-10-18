import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeBondLab,newLabState,orbitalDiagram,overlapDiagram} from '../bond-lab.js';
import {LocalApiStore,SupabaseStore} from '../store.js';
test('lab scores real observations with the same boundary tolerances as the server',()=>{
 assert.equal(gradeBondLab([1,74,4,109.5]).score,4);
 assert.equal(gradeBondLab([0,160,2,180]).score,0);
 assert.equal(gradeBondLab([1,69,4,109.5]).score,4);
 assert.equal(gradeBondLab([1,79,4,109.5]).score,4);
 assert.equal(gradeBondLab([1,79.1,4,109.5]).score,3);
 for(const a of [null,[],[1,74,4,NaN],[true,74,4,109.5],[1,74,4,'109.5']])assert.throws(()=>gradeBondLab(a));
 const s=newLabState();s.p[0]=true;assert.equal(newLabState().p[0],false);
 assert.notEqual(orbitalDiagram(3,0),orbitalDiagram(3,90));
 assert.match(overlapDiagram(74,true),/↑↓/);assert.doesNotMatch(overlapDiagram(74,false),/↑↓/);
});
test('only the changed simulation uses the new grading API',async()=>{
 const local=new LocalApiStore();const paths=[];local.request=async(path)=>{paths.push(path);return {};};
 await local.submitBridgeActivity('lesson','simulation','id',[1,74,4,109.5]);await local.submitBridgeActivity('lesson','context','id',[1,1,3,2]);assert.deepEqual(paths,['/bridge-activity-v3','/bridge-activity-v2']);
 const remote=new SupabaseStore('https://example.test','public');remote.validSession=async()=>({access_token:'verified'});remote.request=async(path,opt)=>{assert.equal(path,'/rest/v1/rpc/submit_bridge_activity_v3');assert.equal(opt.headers.Authorization,'Bearer verified');assert.deepEqual(JSON.parse(opt.body).p_answers,[1,74,4,109.5]);return [{item_id:'lesson'}];};await remote.submitBridgeActivity('lesson','simulation','id',[1,74,4,109.5]);
});
