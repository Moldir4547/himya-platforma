begin;
create table public.bridge_exits (
 id uuid primary key default gen_random_uuid(),
 learner uuid not null references public.profiles(id) on delete cascade,
 lesson text not null check(lesson in ('bond','equivalent')),
 audience text not null check(audience in ('school_student','university_student')),
 step smallint not null check(step between 1 and 4 and (step<4 or audience='university_student')),
 evidence text not null check(length(trim(evidence)) between 1 and 600),
 helpful text not null check(helpful in ('diagram','example','lab','practice','none')),
 difficulty text not null check(difficulty in ('clear','first','second','third','other')),
 note text not null check(length(note)<=400),
 teacher uuid references public.ws_teachers(id) on delete set null,
 review text check(review in ('supported','partial','revisit')),
 revision integer not null default 1,
 updated_at timestamptz not null default now(),
 unique(learner,lesson)
);
create index bridge_exits_teacher on public.bridge_exits(teacher,lesson);
alter table public.bridge_exits enable row level security;
revoke all on public.bridge_exits from public,anon,authenticated;
grant select on public.bridge_exits to authenticated;
create policy exit_own on public.bridge_exits for select to authenticated using(learner=auth.uid());

create function public.bridge_exit_save(p_lesson text,p_step integer,p_evidence text,p_helpful text,p_difficulty text,p_note text,p_code uuid,p_keep boolean,p_revision integer)
returns public.bridge_exits language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); a text; dest uuid; oldrow public.bridge_exits; saved public.bridge_exits;
begin
 select case when participant_type in ('school_student','university_student') then participant_type when role='university_student' then 'university_student' else 'school_student' end into a
 from public.profiles where id=uid and role<>'admin' and coalesce(participant_type,'')<>'teacher';
 if a is null then raise exception 'learner_required'; end if;
 select * into oldrow from public.bridge_exits where learner=uid and lesson=p_lesson for update;
 if p_revision is distinct from coalesce(oldrow.revision,0) then raise exception 'reflection_conflict'; end if;
 if p_code is not null then
  select id into dest from public.ws_teachers where code=p_code;
  if dest is null or dest=uid then raise exception 'unknown_teacher_code'; end if;
 elsif p_keep then dest:=oldrow.teacher;
 end if;
 insert into public.bridge_exits as e(learner,lesson,audience,step,evidence,helpful,difficulty,note,teacher)
 values(uid,p_lesson,a,p_step,trim(p_evidence),p_helpful,p_difficulty,trim(coalesce(p_note,'')),dest)
 on conflict(learner,lesson) do update set audience=excluded.audience,step=excluded.step,evidence=excluded.evidence,helpful=excluded.helpful,difficulty=excluded.difficulty,note=excluded.note,teacher=excluded.teacher,
 review=case when excluded.evidence=e.evidence and excluded.teacher is not distinct from e.teacher then e.review end,revision=e.revision+1,updated_at=now()
 where e.revision=p_revision returning * into saved;
 if saved.id is null then raise exception 'reflection_conflict'; end if;return saved;
end $$;

-- Only server-authorized instructors see their own group; admins can also read school-wide counts.
create function public.bridge_exit_stats(p_lesson text,p_audience text,p_all boolean)
returns table(responses bigint,step smallint,helpful text,difficulty text) language plpgsql stable security definer set search_path='' as $$
begin
 if not exists(select 1 from public.ws_teachers where id=auth.uid()) and not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'teacher_required'; end if;
 if p_all and not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'admin_required'; end if;
 return query select count(*),e.step,e.helpful,e.difficulty from public.bridge_exits e where e.lesson=p_lesson and (p_all or e.teacher=auth.uid()) and (p_audience='all' or e.audience=p_audience) group by e.step,e.helpful,e.difficulty;
end $$;
create function public.bridge_exit_inbox(p_lesson text,p_audience text,p_offset integer)
returns table(id uuid,revision integer,audience text,step smallint,evidence text,helpful text,difficulty text,note text,review text)
language sql stable security definer set search_path='' as $$
 select e.id,e.revision,e.audience,e.step,e.evidence,e.helpful,e.difficulty,e.note,e.review from public.bridge_exits e
 where e.teacher=auth.uid() and e.lesson=p_lesson and (p_audience='all' or e.audience=p_audience)
 order by e.updated_at desc,e.id limit 21 offset greatest(coalesce(p_offset,0),0)
$$;
create function public.bridge_exit_review(p_id uuid,p_revision integer,p_mark text) returns void language plpgsql security definer set search_path='' as $$
begin
 if p_mark is null or p_mark not in ('supported','partial','revisit') then raise exception 'invalid_review'; end if;
 update public.bridge_exits set review=p_mark where id=p_id and teacher=auth.uid() and revision=p_revision;
 if not found then raise exception 'reflection_conflict'; end if;
end $$;
revoke all on function public.bridge_exit_save(text,integer,text,text,text,text,uuid,boolean,integer),public.bridge_exit_stats(text,text,boolean),public.bridge_exit_inbox(text,text,integer),public.bridge_exit_review(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.bridge_exit_save(text,integer,text,text,text,text,uuid,boolean,integer),public.bridge_exit_stats(text,text,boolean),public.bridge_exit_inbox(text,text,integer),public.bridge_exit_review(uuid,integer,text) to authenticated;
notify pgrst,'reload schema';
commit;
