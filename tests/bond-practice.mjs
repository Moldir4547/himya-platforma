import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {BOND_QUESTIONS,gradeBond,bondPracticeView} from '../bond-practice.js';
import {LocalApiStore,SupabaseStore} from '../store.js';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('eight tasks span three levels and every answer has scientific feedback',()=>{
 assert.equal(BOND_QUESTIONS.length,8);
 assert.deepEqual([...new Set(BOND_QUESTIONS.map(q=>q.level))],['Мектеп','Өтпелі','Университет']);
 BOND_QUESTIONS.forEach(q=>{assert.equal(q.options.length,3);assert.ok(q.explanation.length>60);q.options.forEach((_,i)=>{if(i!==q.answer)assert.ok(q.why[i].length>20);});});
 assert.equal(gradeBond(BOND_QUESTIONS.map(q=>q.answer)).score,8);
 assert.equal(gradeBond(BOND_QUESTIONS.map(q=>(q.answer+1)%3)).score,0);
 assert.equal(gradeBond(BOND_QUESTIONS.map((q,i)=>i<4?q.answer:(q.answer+1)%3)).percent,50);
 for(const answers of [null,[],Array(8).fill(-1),Array(8).fill(3),Array(8).fill('1'),Array(8).fill(null),Array(8).fill(1.1)])
   assert.throws(()=>gradeBond(answers));
});
test('server answer keys match the reviewed task version',()=>{
 const key=BOND_QUESTIONS.map(q=>q.answer);
 assert.deepEqual(JSON.parse(read('server.py').match(/key = (\[[\d, ]+\])/)[1]),key);
 assert.deepEqual(JSON.parse(read('supabase/migrations/202610160001_bond_practice.sql').match(/answer_key jsonb := '(.*?)'/)[1]),key);
});
test('both lesson renderers append practice independently of teacher body and quiz',()=>{
 const source=read('app.js');
 assert.ok(source.includes('test:bondPracticeView()+quizBlock(item)'));
 assert.ok(source.includes('if(item.path===BOND_PATH)return bondLearningPage(item)'));
 assert.ok(source.includes('item.path===BOND_PATH?bondLearningPage(item)'));
 assert.ok(source.includes('bondPractice.bind(app,byPath(routePath()))'));
 assert.ok(source.includes('item.body?'));
 // Original theory and review are retained, including diagrams and section destinations.
 const theory=source.slice(source.indexOf('function chemicalBondBridgeTheory(){'),source.indexOf('\nfunction ',source.indexOf('function chemicalBondBridgeTheory(){')+10));
 const context={};vm.runInNewContext(theory+';this.html=chemicalBondBridgeTheory();',context);
 assert.ok((context.html.match(/<svg/g)||[]).length>=10);
 assert.ok(context.html.includes('data-bond-quiz'));
 for(const q of BOND_QUESTIONS)assert.ok(context.html.includes('id="'+q.section+'"'));
 assert.equal((bondPracticeView().match(/data-bp-question=/g)||[]).length,8);
});
test('public asset lists and build include practice assets',()=>{
 for(const path of ['build.mjs','preview.mjs','server.py'])for(const asset of ['bond-practice.js','bond-practice.css'])assert.ok(read(path).includes(asset));
 assert.ok(read('index.html').includes('bond-practice.css'));
});
test('local adapter sends answers and stable attempt id without a client score',async()=>{
 const store=new LocalApiStore();
 store.request=async(path,options)=>{assert.equal(path,'/bond-practice');assert.deepEqual(JSON.parse(options.body),{item_id:'lesson',attempt_id:'attempt',answers:[1]});return {item_id:'lesson'};};
 assert.equal((await store.submitBondPractice('lesson','attempt',[1])).item_id,'lesson');
});
test('Supabase adapter authenticates and calls the dedicated grading RPC',async()=>{
 const store=new SupabaseStore('https://example.test','key');
 store.validSession=async()=>null;await assert.rejects(store.submitBondPractice('lesson','attempt',[]),/жүйеге кіріңіз/);
 store.validSession=async()=>({access_token:'verified'});
 store.request=async(path,options)=>{assert.equal(path,'/rest/v1/rpc/submit_bond_practice');assert.equal(options.headers.Authorization,'Bearer verified');assert.deepEqual(JSON.parse(options.body),{p_item_id:'lesson',p_attempt_id:'attempt',p_answers:[0]});return[{item_id:'lesson'}];};
 assert.equal((await store.submitBondPractice('lesson','attempt',[0])).item_id,'lesson');
 store.request=async()=>[];await assert.rejects(store.submitBondPractice('lesson','attempt',[]),/сақталмады/);
});

