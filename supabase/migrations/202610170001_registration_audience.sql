begin;
alter table public.profiles add column if not exists participant_type text check(participant_type in ('school_student','university_student','teacher'));
-- Historic accounts stay unclassified: the old form always submitted student.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare category text := nullif(new.raw_user_meta_data->>'participant_type','');
begin
 if category is not null and category not in ('school_student','university_student','teacher') then raise exception 'invalid_participant_type'; end if;
 insert into public.profiles(id,display_name,email,username,role,participant_type)
 values(new.id,nullif(btrim(new.raw_user_meta_data->>'display_name'),''),new.email,nullif(lower(btrim(new.raw_user_meta_data->>'username')),''),case when category='university_student' or (category is null and new.raw_user_meta_data->>'role'='university_student') then 'university_student'::public.app_role else 'student'::public.app_role end,category);
 return new;
end $$;
drop function if exists public.admin_registration_report();
create or replace function public.admin_registration_report(p_offset integer default 0,p_limit integer default 1000)
returns table(id uuid,display_name text,email text,role public.app_role,participant_type text,created_at timestamptz,email_confirmed boolean,last_sign_in_at timestamptz)
language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'forbidden'; end if;
 return query select p.id,p.display_name,p.email,p.role,p.participant_type,p.created_at,(u.email_confirmed_at is not null),u.last_sign_in_at from public.profiles p join auth.users u on u.id=p.id order by p.created_at desc,p.id offset greatest(coalesce(p_offset,0),0) limit least(greatest(coalesce(p_limit,1000),1),1000);
end $$;
revoke all on function public.admin_registration_report(integer,integer) from public,anon;
grant execute on function public.admin_registration_report(integer,integer) to authenticated;
create or replace function public.admin_set_participant_type(target_user uuid,category text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'forbidden'; end if;
 if category not in ('school_student','university_student','teacher') or category is null then raise exception 'invalid_participant_type'; end if;
 update public.profiles set participant_type=category where id=target_user and role<>'admin';
 if not found then raise exception 'participant_not_found'; end if;
end $$;
revoke all on function public.admin_set_participant_type(uuid,text) from public,anon;
grant execute on function public.admin_set_participant_type(uuid,text) to authenticated;
commit;
