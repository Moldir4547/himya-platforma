-- Run on the ChemBridge Supabase project before deploying the new registration form.
begin;
alter type public.app_role add value if not exists 'teacher';
alter table public.profiles add column if not exists last_seen_at timestamptz;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path='' as $$
declare requested text;
begin
 requested := new.raw_user_meta_data->>'role';
 insert into public.profiles(id,display_name,email,username,role)
 values(new.id,nullif(btrim(new.raw_user_meta_data->>'display_name'),''),new.email,
 nullif(lower(btrim(new.raw_user_meta_data->>'username')),''),
 (case when requested in ('student','university_student','teacher') then requested else 'student' end)::public.app_role);
 return new;
end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;

create or replace function public.record_platform_visit()
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'authentication_required'; end if;
 update public.profiles set last_seen_at=now() where id=auth.uid();
end $$;
revoke all on function public.record_platform_visit() from public,anon;
grant execute on function public.record_platform_visit() to authenticated;

-- Seed historical signed-in users without classifying anonymous visitors.
update public.profiles p set last_seen_at=u.last_sign_in_at
from auth.users u where p.id=u.id and p.last_seen_at is null and u.last_sign_in_at is not null;
commit;
