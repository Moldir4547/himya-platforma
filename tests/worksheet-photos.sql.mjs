import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
test('photo receipts, private inbox, approved teachers, grade pairing and resubmission',async()=>{
 const db=new PGlite();
 try{
 await db.exec("create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('app.uid',true),'')::uuid $$; grant usage on schema auth to authenticated; create table public.profiles(id uuid primary key,display_name text,role text,participant_type text);");
 const ids=[1,2,3,4].map(n=>'00000000-0000-4000-8000-00000000000'+n);
 for(const [i,id] of ids.entries())await db.query('insert into profiles values($1,$2,$3,$4)',[id,'P'+i,i===0?'admin':'student',i===2?'school_student':'teacher']);
 await db.exec(readFileSync(new URL('../supabase/migrations/202611180001_worksheet_photos.sql',import.meta.url),'utf8'));
 const as=async i=>{await db.exec('reset role');await db.query("select set_config('app.uid',$1,false)",[ids[i]]);await db.exec('set role authenticated');};
 const q=(s,a)=>db.query(s,a);await as(1);assert.equal((await q('select ws_code() code')).rows[0].code,null);
 await assert.rejects(q('select ws_authorize($1)',[ids[1]]));await as(0);await q('select ws_authorize($1)',[ids[1]]);await as(1);
 const {code}=(await q('select ws_code() code')).rows[0];await as(2);await q('select ws_pair(7,$1)',[code]);
 const jpeg='/9j/4AAQ/9k=';const send=(t=ids[1],grade=7,slug='safety-mixtures',image=jpeg)=>q('select ws_send($1,$2,$3,$4) id',[grade,slug,t,image]);
 await assert.rejects(send(ids[0]));await assert.rejects(send(ids[1],8));await assert.rejects(send(ids[1],7,'buffers'));await assert.rejects(send(ids[1],7,'safety-mixtures','cGxhaW4='));
 const receipt=(await send()).rows[0].id;assert.equal((await send()).rows[0].id,receipt);
 await as(1);assert.equal((await q('select learner_name,jpeg from ws_photos')).rows[0].jpeg,jpeg);
 await as(3);assert.equal((await q('select * from ws_photos')).rows.length,0);
 await as(0);assert.equal((await q('select * from ws_photos')).rows.length,0);
 await as(2);assert.equal((await q('select * from ws_photos')).rows.length,1);await assert.rejects(q('delete from ws_photos'));
 }finally{await db.close();}
});
