import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
test('room permissions, synchronized opening, private answer key, immutable score and expiry',async()=>{
const db=new PGlite(),host='00000000-0000-4000-8000-000000000001',student='00000000-0000-4000-8000-000000000002';
const q=(sql,p)=>db.query(sql,p),one=async(sql,p)=>(await q(sql,p)).rows[0].v;
async function role(name,id=''){await db.exec('reset role');await q("select set_config('app.uid',$1,false)",[id]);await db.exec('set role '+name);}
try{
 await db.exec("create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('app.uid',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;create table profiles(id uuid primary key,role text,participant_type text)");
 await q("insert into profiles values($1,'student','teacher'),($2,'student','school_student')",[host,student]);
 await db.exec(readFileSync(new URL('../supabase/migrations/202611230001_classroom_games.sql',import.meta.url),'utf8'));
 await role('authenticated',student);
 await assert.rejects(q("select cb_game_create(10,'hard',60)"),/game_teacher_only/);
 await role('authenticated',host);
 const code=await one("select cb_game_create(10,'hard',60) v");
 assert.match(code,/^[A-F0-9]{8}$/);
 assert.equal(await one('select cb_game_start($1) v',[code]),false);
 await role('anon');
 await assert.rejects(q('select * from cb_game_rooms'),/permission denied/);
 const t=await one("select cb_game_join($1,'Атом7') v",[code]);
 const t2=await one("select cb_game_join($1,'Ion9') v",[code]);
 await assert.rejects(q("select cb_game_join($1,'ion9')",[code]),/game_nickname_taken/);
 assert.equal((await one('select cb_game_state($1,$2) v',[code,t])).phase,'waiting');
 await role('authenticated',host);
 assert.equal(await one('select cb_game_start($1) v',[code]),true);
 await role('anon');
 await assert.rejects(q("select cb_game_join($1,'Late')",[code]),/game_join_closed/);
 const s=await one('select cb_game_state($1,$2) v',[code,t]);
 assert.equal(s.phase,'playing');assert.equal(s.questions.length,3);
 assert.ok(s.questions.every(x=>x.correct===undefined));assert.equal(s.board,undefined);
 await assert.rejects(q('select cb_game_submit($1,$2,$3)',[code,t,[99,0,0]]),/game_invalid/);
 assert.equal(await one('select cb_game_submit($1,$2,$3) v',[code,t,[0,1,2]]),300);
 assert.equal(await one('select cb_game_submit($1,$2,$3) v',[code,t,[1,0,0]]),300);
 await role('authenticated',host);
 assert.deepEqual((await one('select cb_game_state($1,null) v',[code])).board,[{nick:'Атом7',score:300},{nick:'Ion9',score:null}]);
 await db.exec("reset role;update public.cb_game_rooms set started=now()-interval '120 seconds'");
 await role('anon');
 const end=await one('select cb_game_state($1,$2) v',[code,t]);assert.equal(end.phase,'finished');assert.equal(end.review.length,3);
 await assert.rejects(q('select cb_game_submit($1,$2,$3)',[code,t2,[0,1,2]]),/game_round_closed/);
}finally{await db.close();}
});
