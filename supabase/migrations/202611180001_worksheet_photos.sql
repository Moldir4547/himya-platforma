-- Private worksheet delivery. One latest photo per learner/topic/recipient.
begin;
create table public.ws_teachers (
 id uuid primary key references public.profiles(id) on delete cascade,
 code uuid not null unique default gen_random_uuid()
);
create table public.ws_pairs (
 learner uuid not null references public.profiles(id) on delete cascade,
 grade smallint not null check(grade between 7 and 11),
 teacher uuid not null references public.ws_teachers(id) on delete cascade,
 primary key(learner,grade), check(learner<>teacher)
);
create table public.ws_photos (
 id uuid primary key default gen_random_uuid(),
 learner uuid not null references public.profiles(id) on delete cascade,
 teacher uuid not null references public.ws_teachers(id) on delete cascade,
 grade smallint not null, slug text not null, learner_name text not null,
 jpeg text not null check(length(jpeg) between 8 and 1400000),
 sent_at timestamptz not null default now(),
 unique(learner,teacher,grade,slug)
);
create index on public.ws_photos(teacher,sent_at desc,id);
alter table public.ws_teachers enable row level security;
alter table public.ws_pairs enable row level security;
alter table public.ws_photos enable row level security;
revoke all on public.ws_teachers, public.ws_pairs, public.ws_photos from public,anon,authenticated;
grant select on public.ws_photos to authenticated;
create policy ws_parties_read on public.ws_photos for select to authenticated using
 (learner=auth.uid() or teacher=auth.uid());

-- A registration category alone grants no inbox or reading access.
create function public.ws_authorize(p_teacher uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'admin_required'; end if;
 if not exists(select 1 from public.profiles where id=p_teacher and (participant_type='teacher' or role='admin')) then raise exception 'teacher_required'; end if;
 insert into public.ws_teachers(id) values(p_teacher) on conflict do nothing;
end $$;
insert into public.ws_teachers(id) select id from public.profiles where role='admin';

create function public.ws_code() returns uuid language sql stable security definer set search_path='' as $$
 select code from public.ws_teachers where id=auth.uid()
$$;

create function public.ws_recipient(p_grade integer) returns table(id uuid,name text) language sql stable security definer set search_path='' as $$
 select p.id, coalesce(nullif(p.display_name,''),'Мұғалім') from public.ws_pairs a join public.profiles p on p.id=a.teacher where a.learner=auth.uid() and a.grade=p_grade
$$;
create function public.ws_pair(p_grade integer,p_code uuid) returns void language plpgsql security definer set search_path='' as $$
declare t uuid;
begin
 select id into t from public.ws_teachers where code=p_code;
 if auth.uid() is null or t is null or t=auth.uid() or p_grade not between 7 and 11 then raise exception 'invalid_pair'; end if;
 insert into public.ws_pairs(learner,grade,teacher) values(auth.uid(),p_grade,t)
 on conflict(learner,grade) do update set teacher=excluded.teacher;
end $$;

create function public.ws_send(p_grade integer,p_slug text,p_teacher uuid,p_jpeg text) returns uuid language plpgsql security definer set search_path='' as $$
declare sender uuid:=auth.uid(); target uuid; rid uuid; bytes bytea; valid_topic boolean;
begin
 select teacher into target from public.ws_pairs where learner=sender and grade=p_grade for share;
 if sender is null or target is null or target is distinct from p_teacher then raise exception 'recipient_changed'; end if;
 valid_topic:=case p_grade
 when 7 then p_slug in ('safety-mixtures','states-changes','atoms-substances','structure-isotopes','air-combustion','acids-indicators','periodic-table','formulas-masses','body-elements','minerals-kazakhstan')
 when 8 then p_slug in ('electrons-ions','equations-conservation','metals-corrosion','mole-avogadro','stoichiometry-gases','reaction-energy','hydrogen','oxygen-ozone','periodicity','bonding','solutions','oxides','acids-bases','salts-genetic','carbon','water-hardness')
 when 9 then p_slug in ('electrolytes','ionic-reactions','salt-hydrolysis','qualitative-analysis','limiting-mixtures','reaction-rate','equilibrium','redox','metals-alloys','alkali-calcium-aluminium','halogens-hcl','sulfur','nitrogen-ammonia','phosphorus-fertilizers','silicon','elements-environment')
 when 10 then p_slug in ('atomic-orbitals','periodic-properties','bonding-geometry','stoichiometry','enthalpy','entropy-gibbs','kinetics','industrial-equilibrium','redox-balance','galvanic-cells','electrolysis','analytical-methods','halogens','groups-one-two')
 when 11 then p_slug in ('group-fourteen','yield-calculations','nitrogen-industry','nitrogen-environment','sulfur-oxides','sulfuric-process','acid-base-ph','buffers','titration','metallurgy','electroplating','recycling','transition-complexes','nanomaterials','green-chemistry')
 else false end;
 if valid_topic is not true then raise exception 'unknown_topic'; end if;
 if p_jpeg is null or length(p_jpeg) not between 8 and 1400000 then raise exception 'invalid_image'; end if;
 bytes:=decode(p_jpeg,'base64');
 if substring(bytes from 1 for 3)<>decode('ffd8ff','hex') or substring(bytes from octet_length(bytes)-1 for 2)<>decode('ffd9','hex') then raise exception 'invalid_image'; end if;
 insert into public.ws_photos(learner,teacher,grade,slug,learner_name,jpeg)
 select sender,target,p_grade,p_slug,coalesce(nullif(display_name,''),'Оқушы'),p_jpeg from public.profiles where id=sender
 on conflict(learner,teacher,grade,slug) do update set jpeg=excluded.jpeg,learner_name=excluded.learner_name,sent_at=now()
 returning id into rid;
 if rid is null then raise exception 'missing_profile'; end if;
 return rid;
end $$;
revoke all on function public.ws_authorize(uuid),public.ws_code(),public.ws_recipient(integer),public.ws_pair(integer,uuid),public.ws_send(integer,text,uuid,text) from public,anon,authenticated;
grant execute on function public.ws_authorize(uuid),public.ws_code(),public.ws_recipient(integer),public.ws_pair(integer,uuid),public.ws_send(integer,text,uuid,text) to authenticated;
notify pgrst,'reload schema';
commit;
