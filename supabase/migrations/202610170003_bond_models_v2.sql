-- Updated assessments preserve earlier results under context_v1 / test_v1.
begin;
create or replace function public.guard_bridge_assessment() returns trigger language plpgsql set search_path='' as $$
begin
 if current_user in ('authenticated','anon') then
  if TG_OP='INSERT' then
   if new.bridge_learning <> '{}'::jsonb or new.bond_practice <> '{}'::jsonb then raise exception 'use_assessment_rpc'; end if;
  elsif new.bridge_learning is distinct from old.bridge_learning or new.bond_practice is distinct from old.bond_practice then raise exception 'use_assessment_rpc'; end if;
 end if;
 if TG_OP='UPDATE' then
  if coalesce((old.bond_practice->>'version')::integer,1)>coalesce((new.bond_practice->>'version')::integer,1) or coalesce((old.bridge_learning->'context'->>'version')::integer,1)>coalesce((new.bridge_learning->'context'->>'version')::integer,1) then raise exception 'lesson_updated_reload'; end if;
 end if;
 return new;
end; $$;

create or replace function public.submit_bond_practice_v2(p_item_id uuid, p_attempt_id uuid, p_answers jsonb)
returns setof public.user_progress
language plpgsql security definer set search_path = ''
as $$
declare
  previous jsonb;
  calculated_score integer;
  answer_key jsonb := '[1,0,2,1,2,0,1,2]'::jsonb;
begin
  if auth.uid() is null or public.is_admin() then raise exception 'forbidden'; end if;
  if not exists (
    select 1 from public.content_items where id=p_item_id
      and path='/sabaktastyk-kopiri/himiyalyk-bailanys'
      and is_published and public.content_is_visible(id)
  ) then raise exception 'forbidden'; end if;
  if p_attempt_id is null or p_answers is null or jsonb_typeof(p_answers)<>'array' then
    raise exception 'invalid_answers';
  end if;
  if jsonb_array_length(p_answers)<>8 then raise exception 'answer_every_question'; end if;
  if exists(select 1 from jsonb_array_elements(p_answers) a(value)
    where jsonb_typeof(value)<>'number' or value::text not in ('0','1','2')) then
    raise exception 'invalid_answer';
  end if;
  -- Serialize saves for this learner and lesson, including the first attempt.
  insert into public.user_progress(user_id,item_id) values(auth.uid(),p_item_id)
    on conflict(user_id,item_id) do nothing;
  select bond_practice into previous from public.user_progress
    where user_id=auth.uid() and item_id=p_item_id for update;
  if coalesce((previous->>'version')::integer,1)<2 then
    if previous<>'{}'::jsonb then update public.user_progress set bridge_learning=jsonb_set(bridge_learning,'{test_v1}',previous) where user_id=auth.uid() and item_id=p_item_id; end if;
    previous:='{}'::jsonb;
  end if;
  if previous->>'attempt_id' is distinct from p_attempt_id::text then
    select count(*)::integer into calculated_score
      from jsonb_array_elements(p_answers) with ordinality a(value,position)
      where value=answer_key->((position-1)::integer);
    update public.user_progress set bond_practice=jsonb_build_object(
      'version',2,'attempt_id',p_attempt_id,'answers',p_answers,
      'score',calculated_score,'max_score',8,
      'best_score',greatest(calculated_score,coalesce((previous->>'best_score')::integer,0)),
      'attempt_count',coalesce((previous->>'attempt_count')::integer,0)+1,'tested_at',now()
    ),updated_at=now() where user_id=auth.uid() and item_id=p_item_id;
  end if;
  return query select * from public.user_progress where user_id=auth.uid() and item_id=p_item_id;
end;
$$;

create or replace function public.submit_bridge_activity_v2(p_item_id uuid,p_mode text,p_attempt_id uuid,p_answers jsonb)
returns setof public.user_progress language plpgsql security definer set search_path='' as $$
declare previous jsonb; result jsonb; calculated integer:=0; i integer; key_values numeric[]; a numeric; maximum integer:=4;
begin
 if auth.uid() is null or public.is_admin() then raise exception 'forbidden'; end if;
 if not exists(select 1 from public.content_items where id=p_item_id and path='/sabaktastyk-kopiri/himiyalyk-bailanys' and is_published and public.content_is_visible(id)) then raise exception 'forbidden'; end if;
 if p_mode is null or p_mode not in ('theory','context','simulation') or p_attempt_id is null or p_answers is null or jsonb_typeof(p_answers)<>'array' then raise exception 'invalid_activity'; end if;
 if p_mode='theory' then
  if jsonb_array_length(p_answers)<>0 then raise exception 'invalid_answers'; end if;
  maximum:=0;
 else
  if jsonb_array_length(p_answers)<>4 or exists(select 1 from jsonb_array_elements(p_answers) a(value) where jsonb_typeof(value)<>'number') then raise exception 'invalid_answers'; end if;
  key_values:=case when p_mode='context' then array[1,1,3,2]::numeric[] else array[180,104.5,8,4]::numeric[] end;
  for i in 0..3 loop
   a:=(p_answers->>i)::numeric;
   if abs(a)>1000 then raise exception 'invalid_answer'; end if;
   if p_mode='context' and (abs(a)>100 or a<>trunc(a)) then raise exception 'invalid_answer'; end if;
   if (p_mode='simulation' and i<2 and abs(a-key_values[i+1])<0.1) or a=key_values[i+1] then calculated:=calculated+1; end if;
  end loop;
 end if;
 insert into public.user_progress(user_id,item_id) values(auth.uid(),p_item_id) on conflict(user_id,item_id) do nothing;
 select bridge_learning->p_mode into previous from public.user_progress where user_id=auth.uid() and item_id=p_item_id for update;
 if p_mode='context' and coalesce((previous->>'version')::integer,1)<2 then
  if previous is not null and previous<>'{}'::jsonb then update public.user_progress set bridge_learning=jsonb_set(bridge_learning,'{context_v1}',previous) where user_id=auth.uid() and item_id=p_item_id; end if;
  previous:='{}'::jsonb;
 end if;
 if previous->>'attempt_id' is distinct from p_attempt_id::text then
  result:=jsonb_build_object('version',case when p_mode='context' then 2 else 1 end,'completed',true,'attempt_id',p_attempt_id,'answers',p_answers,'score',calculated,'max_score',maximum,'best_score',greatest(calculated,coalesce((previous->>'best_score')::integer,0)),'attempt_count',coalesce((previous->>'attempt_count')::integer,0)+1,'tested_at',now());
  update public.user_progress set bridge_learning=jsonb_set(bridge_learning,array[p_mode],result),updated_at=now() where user_id=auth.uid() and item_id=p_item_id;
 end if;
 return query select * from public.user_progress where user_id=auth.uid() and item_id=p_item_id;
end; $$;

revoke all on function public.submit_bond_practice_v2(uuid,uuid,jsonb) from public,anon;
grant execute on function public.submit_bond_practice_v2(uuid,uuid,jsonb) to authenticated;
revoke all on function public.submit_bridge_activity_v2(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.submit_bridge_activity_v2(uuid,text,uuid,jsonb) to authenticated;
commit;
