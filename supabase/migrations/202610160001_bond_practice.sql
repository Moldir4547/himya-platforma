-- Additive: teacher quiz scores, answers and completion stay unchanged.
begin;
alter table public.user_progress
  add column if not exists bond_practice jsonb not null default '{}'::jsonb
  check (jsonb_typeof(bond_practice) = 'object');

create or replace function public.submit_bond_practice(p_item_id uuid, p_attempt_id uuid, p_answers jsonb)
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
  if previous->>'attempt_id' is distinct from p_attempt_id::text then
    select count(*)::integer into calculated_score
      from jsonb_array_elements(p_answers) with ordinality a(value,position)
      where value=answer_key->((position-1)::integer);
    update public.user_progress set bond_practice=jsonb_build_object(
      'version',1,'attempt_id',p_attempt_id,'answers',p_answers,
      'score',calculated_score,'max_score',8,
      'best_score',greatest(calculated_score,coalesce((previous->>'best_score')::integer,0)),
      'attempt_count',coalesce((previous->>'attempt_count')::integer,0)+1,'tested_at',now()
    ),updated_at=now() where user_id=auth.uid() and item_id=p_item_id;
  end if;
  return query select * from public.user_progress where user_id=auth.uid() and item_id=p_item_id;
end;
$$;
revoke all on function public.submit_bond_practice(uuid,uuid,jsonb) from public;
grant execute on function public.submit_bond_practice(uuid,uuid,jsonb) to authenticated;
commit;

