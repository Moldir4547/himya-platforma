import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
test('self-assessment is separate from review; counts, versions, roles and teacher isolation',async()=>{
 const db=new PGlite(),q=(sql,p)=>db.query(sql,p);try{
 await db.exec("create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('app.uid',true),'')::uuid $$; grant usage on schema auth to authenticated;create table profiles(id uuid primary key,display_name text,role text,participant_type text);");
 const ids=[1,2,3,4,5].map(n=>'00000000-0000-4000-8000-00000000000'+n);
 for(const [i,id] of ids.entries())await q('insert into profiles values($1,$2,$3,$4)',[id,'QA'+i,i===0?'admin':'student',['teacher','teacher','school_student','university_student','teacher'][i]]);
 await db.exec("create table content_items(id text primary key,area text,is_published boolean,path text);create table content_resources(id text primary key,item_id text);insert into content_items values('labs','university',true,'/universitet/ozin-ozi-daiyndau/test'),('hidden','university',false,'/universitet/teoriya/unpublished'),('lectures','university',true,'/universitet/teoriya');insert into content_resources values('lecture1','lectures');");
 for(const f of ['202611180001_worksheet_photos','202611200001_bridge_exit','202611200002_lesson_reflection'])await db.exec(readFileSync(new URL('../supabase/migrations/'+f+'.sql',import.meta.url),'utf8'));
 const as=async i=>{await db.exec('reset role');await q("select set_config('app.uid',$1,false)",[ids[i]]);await db.exec('set role authenticated');};
 await as(0);await q('select ws_authorize($1)',[ids[1]]);await as(1);const code=(await q('select ws_code() code')).rows[0].code;
 const save=(lesson,step,rev=0,c=null,keep=false,text='Иондар қозғалады')=>q("select * from bridge_exit_save($1,$2,$3,'diagram','first','',$4,$5,$6)",[lesson,step,text,c,keep,rev]);
 const stats=(all=false,group='all')=>q("select * from bridge_exit_stats('bond',$1,$2)",[group,all]);
 await as(2);await assert.rejects(save('bond',4));await assert.rejects(save('bond',2,0,ids[3]));const rec=(await save('bond',2,0,code)).rows[0];await assert.rejects(save('bond',1));await assert.rejects(stats());
 await as(3);await save('bond',4);await save('equivalent',4);assert.equal((await q('select * from bridge_exits')).rows.length,2);
 await as(4);await assert.rejects(stats());await assert.rejects(q("select bridge_exit_review($1,1,'partial')",[rec.id]));
 await as(1);assert.equal((await q('select * from bridge_exits')).rows.length,0);assert.equal(Number((await stats()).rows[0].responses),1);await assert.rejects(stats(true));
 assert.equal((await q("select * from bridge_exit_inbox('bond','all',0)")).rows.length,1);
 await q("select bridge_exit_review($1,1,'partial')",[rec.id]);
 await as(2);assert.equal((await q('select review from bridge_exits')).rows[0].review,'partial');
 await save('bond',2,1,null,true,'Ерітіндіде иондар еркін қозғалады');assert.equal((await q('select review from bridge_exits')).rows[0].review,null);
 await as(1);await assert.rejects(q("select bridge_exit_review($1,1,'partial')",[rec.id]));
 await as(0);assert.equal((await stats(true)).rows.reduce((s,v)=>s+Number(v.responses),0),2);assert.equal(Number((await stats(true,'school_student')).rows[0].responses),1);await assert.rejects(save('bond',2));
 await as(2);await save('bond',2,2);await as(1);assert.equal((await stats()).rows.length,0);
 await as(2);await save('school:safety-mixtures',2);await save('school:bonding',1);
 await assert.rejects(save('school:no-such-lesson',2));await assert.rejects(save('uni:hidden',2));
 await as(3);await save('lecture:lecture1',4);await save('uni:labs',3);await assert.rejects(save('lecture:missing',4));
 }finally{await db.close();}
});
