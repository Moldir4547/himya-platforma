// Run with @electric-sql/pglite installed; uses an isolated in-memory PostgreSQL.
import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const {PGlite}=await import(process.env.PGLITE_MODULE||'@electric-sql/pglite');
const db=new PGlite();await db.exec(`create role anon;create role authenticated;create schema auth;
create table auth.users(id uuid primary key,admin boolean default false);
create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
create function public.is_admin() returns boolean language sql stable security definer as $$select coalesce((select admin from auth.users where id=auth.uid()),false)$$;
create table public.content_items(id uuid primary key,path text,is_published boolean);
create function public.content_is_visible(uuid) returns boolean language sql stable as $$select true$$;
create table public.user_progress(user_id uuid references auth.users,item_id uuid references content_items,school_learning jsonb not null default '{}',updated_at timestamptz default now(),primary key(user_id,item_id));
alter table public.user_progress enable row level security;
create policy own_progress on public.user_progress for select using(user_id=auth.uid() or public.is_admin());
grant usage on schema public,auth to authenticated,anon;grant select on public.user_progress to authenticated;`);
await db.exec(readFileSync(new URL('../supabase/migrations/202610190002_guided_lab_journals.sql',import.meta.url),'utf8'));
await db.exec(readFileSync(new URL('../supabase/migrations/202610210001_grade_eight_guided_labs.sql',import.meta.url),'utf8'));
await db.exec(readFileSync(new URL('../supabase/migrations/202610210002_grade_nine_guided_labs.sql',import.meta.url),'utf8'));
await db.exec(readFileSync(new URL('../supabase/migrations/202610210003_grade_ten_guided_labs.sql',import.meta.url),'utf8'));
const owner='00000000-0000-0000-0000-000000000001',other='00000000-0000-0000-0000-000000000002',admin='00000000-0000-0000-0000-000000000003',item='00000000-0000-0000-0000-000000000007';
await db.exec(`insert into auth.users values('${owner}',false),('${other}',false),('${admin}',true);insert into content_items values('${item}','/mektep/teoriya/7-synyp',true);`);
const {LABS8}=await import('../guided-lab-8-data.js');
const {LABS9}=await import('../guided-lab-9-data.js');
const item9='00000000-0000-0000-0000-000000000009';await db.exec(`insert into content_items values('${item9}','/mektep/teoriya/9-synyp',true);`);
const {LABS10}=await import('../guided-lab-10-data.js');
const item10='00000000-0000-0000-0000-000000000010';await db.exec(`insert into content_items values('${item10}','/mektep/teoriya/10-synyp',true);`);
const labs=[...JSON.parse(readFileSync(new URL('../guided-lab-catalog.json',import.meta.url),'utf8')),...LABS8,...LABS9,...LABS10];
const item8='00000000-0000-0000-0000-000000000008';await db.exec(`insert into content_items values('${item8}','/mektep/teoriya/8-synyp',true);`);
async function as(uid,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);await db.exec('set role '+role);}
async function save(id,r,rev){return db.query('select * from public.save_guided_lab($1,$2,$3::jsonb,$4)',[id.startsWith('g10-')?item10:id.startsWith('g9-')?item9:id.startsWith('g8-')?item8:item,id,JSON.stringify(r),rev]);}
try{await as(owner);
await assert.rejects(()=>db.query('select * from public.save_guided_lab($1,$2,$3::jsonb,$4)',[item,'g8-mass',JSON.stringify({index:0,tools:[],notes:LABS8[0].steps.map(()=>''),conclusion:'',elapsedMs:0,finished:false,attempt:1}),0]),/forbidden/);
for(const wrongItem of [item,item8])await assert.rejects(()=>db.query('select * from public.save_guided_lab($1,$2,$3::jsonb,$4)',[wrongItem,LABS9[0].id,JSON.stringify({index:0}),0]),/forbidden/);
for(const wrongItem of [item,item8,item9])await assert.rejects(()=>db.query('select * from public.save_guided_lab($1,$2,$3::jsonb,$4)',[wrongItem,LABS10[0].id,JSON.stringify({index:0}),0]),/forbidden/);
for(const l of labs){const r={index:0,tools:[],notes:l.steps.map(()=>''),conclusion:'',elapsedMs:12000,finished:false,attempt:1};
const draft=await save(l.id,r,0);assert.equal(draft.rows[0].school_learning._guided_labs[l.id].revision,1);
await assert.rejects(()=>save(l.id,r,0),/stale_journal/);await assert.rejects(()=>save(l.id,{...r,finished:true},1),/incomplete_report/);
const final={...r,index:l.steps.length,tools:l.tools,notes:l.steps.map(()=>'Мен байқалған құбылысты өз сөзіммен жаздым.'),conclusion:'Бақылаулар арқылы жасалған ғылыми қорытынды.',finished:true};
assert.equal((await save(l.id,final,1)).rows[0].school_learning._guided_labs[l.id].finished,true);
const next={...r,attempt:2};const result=(await save(l.id,next,2)).rows[0].school_learning._guided_labs[l.id];assert.equal(result.previous.finished,true);
}
await assert.rejects(()=>db.exec("update public.user_progress set school_learning='{}'"),/permission denied/);
await as(other);assert.equal((await db.query('select * from user_progress')).rows.length,0);assert.equal((await db.query('select * from guided_lab_attempts')).rows.length,0);
await as(admin);assert.equal((await db.query('select * from user_progress')).rows.length,4);assert.equal((await db.query('select * from guided_lab_attempts')).rows.length,100);
await assert.rejects(()=>save('hydrogen',{index:0},0),/forbidden/);await as('', 'anon');await assert.rejects(()=>save('hydrogen',{},0),/permission denied/);
console.log('PostgreSQL: 50 journals across grades 7–10, completion bounds, restart history, stale writes, owner/admin RLS and anonymous denial passed.');
}finally{await db.close();}
