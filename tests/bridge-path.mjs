import test from 'node:test';
import assert from 'node:assert/strict';
import {gradeContext,gradeSimulation,bridgeSummary,bridgeResults} from '../bridge-path.js';
import {LocalApiStore,SupabaseStore} from '../store.js';
test('context and experimental observations are graded separately from completion',()=>{
 assert.deepEqual(gradeContext([1,1,3,2]).correct,[true,true,true,true]);
 assert.equal(gradeContext([0,0,3,0]).score,1);
 assert.equal(gradeSimulation([1,74,4,109.5]).score,4);
 assert.equal(gradeSimulation([0,160,2,180]).score,0);
 for(const a of [null,[],[1,1,2,'6'],[1,1,2,6.1],[1,1,2,Infinity]])assert.throws(()=>gradeContext(a));
 for(const a of [[],[180,104.5,8,NaN],[180,104.5,8,'4'],[180,104.5,8,1001]])assert.throws(()=>gradeSimulation(a));
 const row={bridge_learning:{theory:{completed:true},context:{version:2,completed:true,score:0,max_score:4}},bond_practice:{version:2,score:0,max_score:8}};
 assert.equal(bridgeSummary(row).percent,75);assert.equal(bridgeSummary({}).percent,0);
 assert.ok(bridgeResults(row).includes('0 / 4 ұпай'));assert.ok(bridgeResults(row).includes('0 / 8 ұпай'));
});
test('activity API sends answers only and requires a verified owner',async()=>{
 const local=new LocalApiStore();local.request=async(path,opt)=>{assert.equal(path,'/bridge-activity-v2');const body=JSON.parse(opt.body);assert.deepEqual(body,{item_id:'lesson',mode:'context',attempt_id:'id',answers:[1,1,3,2]});return {item_id:'lesson'};};
 assert.equal((await local.submitBridgeActivity('lesson','context','id',[1,1,3,2])).item_id,'lesson');
 const remote=new SupabaseStore('https://example.test','public');remote.validSession=async()=>null;await assert.rejects(remote.submitBridgeActivity('lesson','theory','id',[]));
 remote.validSession=async()=>({access_token:'verified'});remote.request=async(path,opt)=>{assert.equal(path,'/rest/v1/rpc/submit_bridge_activity_v2');assert.equal(opt.headers.Authorization,'Bearer verified');assert.deepEqual(JSON.parse(opt.body),{p_item_id:'lesson',p_mode:'theory',p_attempt_id:'id',p_answers:[]});return [{item_id:'lesson'}];};assert.equal((await remote.submitBridgeActivity('lesson','theory','id',[])).item_id,'lesson');
});
