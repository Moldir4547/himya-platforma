import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,admin boolean default false);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function public.is_admin() returns boolean language sql stable security definer as $$select coalesce((select admin from auth.users where id=auth.uid()),false)$$;
create table content_items(id uuid primary key default gen_random_uuid(),parent_id uuid references content_items,area text,title text,path text unique,item_type text,content_mode text,body text,sort_order integer,is_published boolean);
create function public.content_is_visible(uuid) returns boolean language sql stable as $$select is_published from public.content_items where id=$1$$;
create table user_progress(user_id uuid references auth.users,item_id uuid references content_items,progress integer,completed boolean,score integer,max_score integer,quiz_answers jsonb,attempt_count integer default 0,tested_at timestamptz,updated_at timestamptz,primary key(user_id,item_id));
alter table user_progress enable row level security;
create policy own on user_progress for select using(user_id=auth.uid() or public.is_admin());
grant usage on schema public,auth to authenticated,anon;grant select on user_progress to authenticated;
insert into content_items(path,is_published)values('/universitet',true);`);
await db.exec(readFileSync(new URL('../supabase/migrations/202610200001_university_current_control.sql',import.meta.url),'utf8'));
const owner='00000000-0000-0000-0000-000000000001',other='00000000-0000-0000-0000-000000000002',admin='00000000-0000-0000-0000-000000000003';
await db.exec(`insert into auth.users values('${owner}',false),('${other}',false),('${admin}',true)`);
async function as(uid,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role '+role);}
const start=async(restart=false)=>(await db.query('select start_university_control($1) as value',[restart])).rows[0].value;
const save=async(a,answers,finish=false)=>(await db.query('select save_university_control($1,$2::jsonb,$3,$4) as value',[a.id,JSON.stringify(answers),a.revision,finish])).rows[0].value;
try{
 await as(owner);let a=await start();assert.equal(a.answers.length,30);assert.ok(Math.abs(Date.parse(a.deadline)-Date.parse(a.started_at)-1800000)<10);
 assert.equal((await start(true)).id,a.id);
 await assert.rejects(()=>save(a,[-1]),/invalid_answers/);
 await assert.rejects(()=>save(a,[0.2,...Array(29).fill(-1)]),/invalid_answer/);
 const correct=a.questions.map(q=>q.correct_index);
 let r=await save(a,correct);await assert.rejects(()=>save(a,correct),/stale_attempt/);a=r.attempt;
 r=await save(a,correct,true);assert.equal(r.attempt.score,30);assert.equal(r.progress.score,30);assert.equal(r.progress.quiz_answers.length,30);
 const again=await save(a,Array(30).fill(-1),true);assert.equal(again.attempt.score,30);assert.equal(again.progress.attempt_count,1);
 let b=await start(true);assert.notEqual(b.id,a.id);b=(await save(b,[correct[0],...Array(29).fill(-1)])).attempt;
 await db.exec('reset role');await db.query("update university_control_attempts set deadline=clock_timestamp()-interval '1 second' where id=$1",[b.id]);
 await as(owner);const expired=await save(b,correct,true);assert.equal(expired.attempt.score,1);assert.equal(expired.progress.attempt_count,2);
 assert.equal((await db.query('select * from university_control_attempts')).rows.length,2);
 await as(other);assert.equal((await db.query('select * from university_control_attempts')).rows.length,0);await assert.rejects(()=>save(a,correct,true),/forbidden/);
 await assert.rejects(()=>db.exec("update university_control_attempts set score=30"),/permission denied/);
 await as(admin);assert.equal((await db.query('select * from university_control_attempts')).rows.length,2);await assert.rejects(()=>start(),/forbidden/);
 await as('', 'anon');await assert.rejects(()=>start(),/permission denied/);
 console.log('University control PostgreSQL: timer, resume, answers, deadline, scores, idempotence, history, RLS passed.');
}finally{await db.close();}
