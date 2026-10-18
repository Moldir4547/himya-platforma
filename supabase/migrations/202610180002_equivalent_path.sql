-- Reaction-dependent equivalent activities; original content and teacher tests are untouched.
begin;
create or replace function public.submit_equivalent_activity(p_item_id uuid,p_mode text,p_attempt_id uuid,p_answers jsonb)
returns setof public.user_progress language plpgsql security definer set search_path='' as $$
declare previous jsonb; result jsonb; calculated integer:=0; i integer; key_values numeric[]; a numeric;
begin
 if auth.uid() is null or public.is_admin() then raise exception 'forbidden'; end if;
 if not exists(select 1 from public.content_items where id=p_item_id and path='/sabaktastyk-kopiri/ekvivalent-ugymy' and is_published and public.content_is_visible(id)) then raise exception 'forbidden'; end if;
 if p_mode is null or p_mode not in ('theory','context','simulation','test') or p_attempt_id is null or p_answers is null or jsonb_typeof(p_answers)<>'array' then raise exception 'invalid_activity'; end if;
 key_values:=case p_mode when 'theory' then array[]::numeric[] when 'context' then array[0,1,2]::numeric[] when 'simulation' then array[2,49,25,0.1]::numeric[] else array[1,0,2,1,0,2,1,2,0,1]::numeric[] end;
 if jsonb_array_length(p_answers)<>cardinality(key_values) or exists(select 1 from jsonb_array_elements(p_answers) a(value) where jsonb_typeof(value)<>'number') then raise exception 'invalid_answers'; end if;
 if cardinality(key_values)>0 then
  for i in 0..cardinality(key_values)-1 loop
   a:=(p_answers->>i)::numeric;
   if abs(a)>1000 or (p_mode in ('context','test') and (a<>trunc(a) or a<0 or a>2)) then raise exception 'invalid_answer'; end if;
   if abs(a-key_values[i+1])<0.0001 then calculated:=calculated+1; end if;
  end loop;
 end if;
 insert into public.user_progress(user_id,item_id) values(auth.uid(),p_item_id) on conflict(user_id,item_id) do nothing;
 select bridge_learning->p_mode into previous from public.user_progress where user_id=auth.uid() and item_id=p_item_id for update;
 if previous->>'attempt_id' is distinct from p_attempt_id::text then
  result:=jsonb_build_object('version',1,'completed',true,'attempt_id',p_attempt_id,'answers',p_answers,'score',calculated,'max_score',cardinality(key_values),'best_score',greatest(calculated,coalesce((previous->>'best_score')::integer,0)),'attempt_count',coalesce((previous->>'attempt_count')::integer,0)+1,'tested_at',now());
  update public.user_progress set bridge_learning=jsonb_set(bridge_learning,array[p_mode],result)||jsonb_build_object('lesson','equivalent'),updated_at=now() where user_id=auth.uid() and item_id=p_item_id;
 end if;
 return query select * from public.user_progress where user_id=auth.uid() and item_id=p_item_id;
end; $$;
revoke all on function public.submit_equivalent_activity(uuid,text,uuid,jsonb) from public,anon;
grant execute on function public.submit_equivalent_activity(uuid,text,uuid,jsonb) to authenticated;
commit;
