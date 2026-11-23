begin;
create table public.cb_game_rooms(
 code text primary key, host uuid not null, grade int not null, difficulty text not null,
 quiz jsonb not null, seconds int not null, started timestamptz,
 expires timestamptz not null default (now()+interval '2 hours')
);
create index cb_game_rooms_host on public.cb_game_rooms(host,expires);
create table public.cb_game_players(
 room text not null references public.cb_game_rooms(code) on delete cascade,
 ticket uuid not null default gen_random_uuid(), nick text not null, score integer,
 primary key(room,ticket), unique(room,nick)
);
alter table public.cb_game_rooms enable row level security;
alter table public.cb_game_players enable row level security;
revoke all on public.cb_game_rooms, public.cb_game_players from public,anon,authenticated;
create function public.cb_game_create(p_grade int,p_difficulty text,p_seconds int) returns text
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); k text; q jsonb;
begin
 if uid is null or not exists(select 1 from public.profiles where id=uid and (role='admin' or participant_type='teacher')) then raise exception 'game_teacher_only'; end if;
 if p_grade is null or p_grade not between 7 and 11 or p_difficulty is null or p_difficulty not in ('easy','hard') or p_seconds is null or p_seconds not in (60,120,180,300) then raise exception 'game_invalid'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text)::bigint);
 delete from public.cb_game_rooms where expires<now();
 if (select count(*) from public.cb_game_rooms where host=uid)>=5 then raise exception 'game_limit'; end if;
 q:=$bank${"7-easy":[{"prompt":"Оттек · O₂","choices":["Күрделі зат","Қоспа","Жай зат"],"correct":2,"why":"O₂ молекуласында бір ғана элементтің атомдары бар."},{"prompt":"Ас тұзы · NaCl","choices":["Жай зат","Күрделі зат","Қоспа"],"correct":1,"why":"NaCl құрамында натрий мен хлор бар."},{"prompt":"Ауа","choices":["Қоспа","Жай зат","Күрделі зат"],"correct":0,"why":"Ауа — бірнеше газдың қоспасы."}],"7-hard":[{"prompt":"Тазартылған суда еріген ас тұзы","choices":["Күрделі зат","Қоспа","Жай зат"],"correct":1,"why":"Су мен тұз бірге біртекті қоспа түзеді."},{"prompt":"Таза озон · O₃","choices":["Жай зат","Күрделі зат","Қоспа"],"correct":0,"why":"Үш атом болғанымен, бәрі оттек атомдары."},{"prompt":"Таза көмірқышқыл газы · CO₂","choices":["Қоспа","Жай зат","Күрделі зат"],"correct":2,"why":"Көміртек пен оттек бір қосылыс түзеді."}],"8-easy":[{"prompt":"Ең кіші бүтін коэффициенттер: H₂ + O₂ → H₂O","choices":["2 : 1 : 2","4 : 2 : 4","2 : 1 : 3"],"correct":0,"why":"Ең кіші бүтін қатынас — 2 : 1 : 2."},{"prompt":"Ең кіші бүтін коэффициенттер: Na + Cl₂ → NaCl","choices":["2 : 1 : 3","2 : 1 : 2","4 : 2 : 4"],"correct":1,"why":"Ең кіші бүтін қатынас — 2 : 1 : 2."},{"prompt":"Ең кіші бүтін коэффициенттер: Mg + O₂ → MgO","choices":["4 : 2 : 4","2 : 1 : 3","2 : 1 : 2"],"correct":2,"why":"Ең кіші бүтін қатынас — 2 : 1 : 2."}],"8-hard":[{"prompt":"Ең кіші бүтін коэффициенттер: Fe + O₂ → Fe₂O₃","choices":["4 : 3 : 2","8 : 6 : 4","4 : 3 : 3"],"correct":0,"why":"Ең кіші бүтін қатынас — 4 : 3 : 2."},{"prompt":"Ең кіші бүтін коэффициенттер: Al + O₂ → Al₂O₃","choices":["4 : 3 : 3","4 : 3 : 2","8 : 6 : 4"],"correct":1,"why":"Ең кіші бүтін қатынас — 4 : 3 : 2."},{"prompt":"Ең кіші бүтін коэффициенттер: C₃H₈ + O₂ → CO₂ + H₂O","choices":["2 : 10 : 6 : 8","1 : 5 : 3 : 5","1 : 5 : 3 : 4"],"correct":2,"why":"Ең кіші бүтін қатынас — 1 : 5 : 3 : 4."}],"9-easy":[{"prompt":"Ag⁺ пен Cl⁻ бір ерітіндіде кездескенде қандай тұнба түзіледі?","choices":["NaCl","KNO₃","AgCl"],"correct":2,"why":"Ag⁺ + Cl⁻ → AgCl↓."},{"prompt":"Ba²⁺ + SO₄²⁻ → ?","choices":["BaCl₂","BaSO₄","Na₂SO₄"],"correct":1,"why":"Барий сульфаты нашар ериді."},{"prompt":"H⁺ пен OH⁻ қосылғанда не түзіледі?","choices":["H₂O","H₂","O₂"],"correct":0,"why":"Бейтараптануда су түзіледі."}],"9-hard":[{"prompt":"NaCl + AgNO₃ → AgCl↓ + NaNO₃. Қысқартылған теңдеуге кірмейтін иондар?","choices":["Na⁺ пен NO₃⁻","Na⁺ пен Cl⁻","Ag⁺ пен Cl⁻"],"correct":0,"why":"Na⁺ және NO₃⁻ екі жақта да өзгеріссіз қалады."},{"prompt":"Қай жағдайдағы нәтиже ион алмасуды көрсетеді?","choices":["Екі еритін нитратты араластырғанда өзгеріс жоқ","Екі ерітінді де бастапқыда мөлдір","Араластырудан кейін ерімейтін тұнба түзіледі"],"correct":2,"why":"Тұнба иондардың ерітіндіден бөлініп шыққанын көрсетеді."},{"prompt":"Қай қысқартылған теңдеу атом саны мен зарядты сақтайды?","choices":["CO₃²⁻ + 3H⁺ → CO₂ + H₂O","CO₃²⁻ + 2H⁺ → CO₂ + H₂O","CO₃²⁻ + H⁺ → CO₂ + H₂O"],"correct":1,"why":"Сол жағындағы −2 және +2 зарядтары теңеседі; атом саны да сақталады."}],"10-easy":[{"prompt":"B (Z = 5): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑ | □ | □","□ | □ | □","↑ | ↑ | □"],"correct":0,"why":"2p-де 1 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."},{"prompt":"C (Z = 6): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑ | ↑ | ↑","↑ | ↑ | □","↑↓ | □ | □"],"correct":1,"why":"2p-де 2 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."},{"prompt":"O (Z = 8): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑↓ | ↑↓ | □","↑↓ | ↑↓ | ↑","↑↓ | ↑ | ↑"],"correct":2,"why":"2p-де 4 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."}],"10-hard":[{"prompt":"N (Z = 7): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑ | ↑ | ↑","↑↓ | ↑ | □","↑↓ | ↑ | ↑"],"correct":0,"why":"2p-де 3 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."},{"prompt":"F (Z = 9): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑↓ | ↑↓ | ↑↓","↑↓ | ↑↓ | ↑","↑↓ | ↑↓ | □"],"correct":1,"why":"2p-де 5 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."},{"prompt":"Ne (Z = 10): негізгі күйдегі 2p орбитальдарын таңда.","choices":["↑↓ | ↑ | ↑","↑↓ | ↑↓ | ↑","↑↓ | ↑↓ | ↑↓"],"correct":2,"why":"2p-де 6 электрон: алдымен бос орбитальдарға бір-бірден, содан кейін жұппен орналасады."}],"11-easy":[{"prompt":"20,0 мл 0,10 М HCl ерітіндісі 0,10 М NaOH-пен титрленді. NaOH көлемі?","choices":["20 мл","40 мл","10 мл"],"correct":0,"why":"HCl мен NaOH қатынасы 1:1. Концентрациялар тең болғандықтан, көлемдері де тең."},{"prompt":"25,0 мл 0,20 М HCl үшін 0,10 М NaOH көлемі?","choices":["25 мл","50 мл","100 мл"],"correct":1,"why":"c₁V₁ = c₂V₂: 25,0 × 0,20 / 0,10 = 50 мл."},{"prompt":"10,0 мл 0,15 М NaOH үшін 0,15 М HCl көлемі?","choices":["20 мл","5 мл","10 мл"],"correct":2,"why":"1:1 қатынаста концентрациялар тең болса, V₁ = V₂."}],"11-hard":[{"prompt":"20,0 мл 0,10 М H₂SO₄-ті толық бейтараптандыруға қажет 0,10 М NaOH көлемі?","choices":["40 мл","80 мл","20 мл"],"correct":0,"why":"1 моль H₂SO₄ толық бейтараптанғанда 2 моль NaOH жұмсалады."},{"prompt":"15,0 мл 0,20 М Ba(OH)₂ үшін қажет 0,10 М HCl көлемі?","choices":["30 мл","60 мл","120 мл"],"correct":1,"why":"1 моль Ba(OH)₂-ге 2 моль HCl қажет. 15,0 × 0,20 × 2 / 0,10 = 60 мл."},{"prompt":"10,0 мл 0,15 М H₂SO₄ үшін 0,25 М NaOH көлемі?","choices":["24 мл","6 мл","12 мл"],"correct":2,"why":"V = 2 × 10,0 × 0,15 / 0,25 = 12 мл."}]}$bank$::jsonb->(p_grade::text||'-'||p_difficulty);
 loop
  k:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.cb_game_rooms(code,host,grade,difficulty,quiz,seconds) values(k,uid,p_grade,p_difficulty,q,p_seconds) on conflict do nothing;
  if found then return k; end if;
 end loop;
end $$;
create function public.cb_game_join(p_code text,p_nick text) returns uuid
language plpgsql security definer set search_path='' as $$
declare r public.cb_game_rooms; k uuid; n text:=trim(coalesce(p_nick,''));
begin
 if char_length(n) not between 2 and 18 or n !~ '^[A-Za-zА-Яа-яЁёӘәІіҢңҒғҮүҰұҚқӨөҺһ0-9_-]+$' then raise exception 'game_nickname'; end if;
 select * into r from public.cb_game_rooms where code=p_code and expires>now() for update;
 if not found or r.started is not null then raise exception 'game_join_closed'; end if;
 if (select count(*) from public.cb_game_players where room=p_code)>=45 then raise exception 'game_full'; end if;
 if exists(select 1 from public.cb_game_players where room=p_code and lower(nick)=lower(n)) then raise exception 'game_nickname_taken'; end if;
 insert into public.cb_game_players(room,nick) values(p_code,n) returning ticket into k;return k;
end $$;
create function public.cb_game_start(p_code text) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.cb_game_rooms where code=p_code and host=auth.uid() and expires>now() and started is null for update;
 if not found then return false; end if;
 if not exists(select 1 from public.cb_game_players where room=p_code) then return false;end if;
 update public.cb_game_rooms set started=clock_timestamp() where code=p_code;
 return true;
end $$;
create function public.cb_game_state(p_code text,p_ticket uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r public.cb_game_rooms; p public.cb_game_players; h boolean; left_sec int; phase text; body jsonb;
begin
 select * into r from public.cb_game_rooms where code=p_code and expires>now();
 if not found then raise exception 'game_room_missing'; end if;
 h:=coalesce(r.host=auth.uid(),false);
 if not h then
  select * into p from public.cb_game_players where room=p_code and ticket=p_ticket;
  if not found then raise exception 'game_room_missing'; end if;
 end if;
 left_sec:=case when r.started is null then r.seconds else greatest(0,ceil(extract(epoch from (r.started + r.seconds*interval '1 second' - clock_timestamp())))::int) end;
 phase:=case when r.started is null then 'waiting' when left_sec>0 then 'playing' else 'finished' end;
 body:=jsonb_build_object('phase',phase,'seconds',left_sec,'score',p.score,'total',jsonb_array_length(r.quiz));
 if h then
  return body||jsonb_build_object('board',coalesce((select jsonb_agg(jsonb_build_object('nick',x.nick,'score',x.score) order by x.score desc nulls last,x.nick) from public.cb_game_players x where room=p_code),'[]'::jsonb));
 end if;
 if phase='playing' then return body||jsonb_build_object('questions',(select jsonb_agg(q.value-'correct'-'why' order by q.ordinality) from jsonb_array_elements(r.quiz) with ordinality q));end if;
 if phase='finished' then return body||jsonb_build_object('review',r.quiz);end if;
 return body;
end $$;
create function public.cb_game_submit(p_code text,p_ticket uuid,p_answers int[]) returns int
language plpgsql security definer set search_path='' as $$
declare r public.cb_game_rooms; p public.cb_game_players; pts int:=0;
begin
 select * into p from public.cb_game_players where room=p_code and ticket=p_ticket for update;
 if not found then raise exception 'game_room_missing';end if;
 select * into r from public.cb_game_rooms where code=p_code and expires>now();
 if not found then raise exception 'game_room_missing';end if;
 if p.score is not null then return p.score;end if;
 if r.started is null or r.started+r.seconds*interval '1 second'<=clock_timestamp() then raise exception 'game_round_closed';end if;
 if coalesce(array_length(p_answers,1),0)<>jsonb_array_length(r.quiz) or exists(select 1 from unnest(p_answers) n where n not between -1 and 2 or n is null) then raise exception 'game_invalid';end if;
 for i in 1..jsonb_array_length(r.quiz) loop
  if p_answers[i]=(r.quiz->(i-1)->>'correct')::int then pts:=pts+100;end if;
 end loop;
 update public.cb_game_players set score=pts where room=p_code and ticket=p_ticket;
 return pts;
end $$;
revoke all on function public.cb_game_create(int,text,int),public.cb_game_start(text),public.cb_game_join(text,text),public.cb_game_state(text,uuid),public.cb_game_submit(text,uuid,int[]) from public,anon,authenticated;
grant execute on function public.cb_game_create(int,text,int),public.cb_game_start(text) to authenticated;
grant execute on function public.cb_game_join(text,text),public.cb_game_state(text,uuid),public.cb_game_submit(text,uuid,int[]) to anon,authenticated;
notify pgrst,'reload schema';
commit;
