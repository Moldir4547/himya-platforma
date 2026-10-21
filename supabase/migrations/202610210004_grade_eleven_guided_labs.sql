begin;
-- Extend only the laboratory catalog; keep the save RPC and owner/admin policies.
alter table public.guided_lab_specs drop constraint if exists guided_lab_specs_grade_check;
alter table public.guided_lab_specs add constraint guided_lab_specs_grade_check check (grade in (7,8,9,10,11));
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-ph',6,'["Екі 100 мл өлшеуіш колба","10,00 мл пипетка және толтырғыш","0,0100 М HCl","0,0100 М NaOH","Дистилденген су","Калибрленген pH-метр"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-buffer',6,'["100 мл фосфат буфері","100 мл CO₂-сіз су моделі","0,100 М HCl","0,10 мл микропипетка","Екі таза стакан","Калибрленген pH-метр"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-titration',6,'["Бюретка және тұрғы","0,1000 М NaOH","10,00 мл HCl үлгісі","Конусты колба","Пипетка және толтырғыш","Фенолфталеин"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-complex',6,'["Тартпа шкаф моделі","Екі сынауық","CuSO₄ ерітіндісі","Дайын NH₃ ерітіндісі","Дистилденген су","Бөлек тамшуырлар"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-plating',6,'["Тазартылған болат қасық моделі","Мыс анод","Дайын CuSO₄ электролиті","Төмен кернеулі ток көзі","Амперметр және уақыт өлшегіш","Таразы"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
insert into public.guided_lab_specs(id,steps,tools,grade) values('g11-silicate',6,'["Екі таза сынауық","Na₂SiO₃ ерітіндісі","Дистилденген су","Сұйылтылған HCl","Бөлек тамшуырлар"]'::jsonb,11) on conflict(id) do update set steps=excluded.steps,tools=excluded.tools,grade=excluded.grade;
commit;
