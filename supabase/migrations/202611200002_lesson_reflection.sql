begin;
-- Broaden lesson coverage without changing existing answers, RPCs, or their visibility.
create or replace function public.exit_topic_exists(k text) returns boolean
language sql stable set search_path='' as $$
  select case
    when k in ('bond','equivalent','school:safety-mixtures',
      'school:states-changes',
      'school:atoms-substances',
      'school:structure-isotopes',
      'school:air-combustion',
      'school:acids-indicators',
      'school:periodic-table',
      'school:formulas-masses',
      'school:body-elements',
      'school:minerals-kazakhstan',
      'school:electrons-ions',
      'school:equations-conservation',
      'school:metals-corrosion',
      'school:mole-avogadro',
      'school:stoichiometry-gases',
      'school:reaction-energy',
      'school:hydrogen',
      'school:oxygen-ozone',
      'school:periodicity',
      'school:bonding',
      'school:solutions',
      'school:oxides',
      'school:acids-bases',
      'school:salts-genetic',
      'school:carbon',
      'school:water-hardness',
      'school:electrolytes',
      'school:ionic-reactions',
      'school:salt-hydrolysis',
      'school:qualitative-analysis',
      'school:limiting-mixtures',
      'school:reaction-rate',
      'school:equilibrium',
      'school:redox',
      'school:metals-alloys',
      'school:alkali-calcium-aluminium',
      'school:halogens-hcl',
      'school:sulfur',
      'school:nitrogen-ammonia',
      'school:phosphorus-fertilizers',
      'school:silicon',
      'school:elements-environment',
      'school:atomic-orbitals',
      'school:periodic-properties',
      'school:bonding-geometry',
      'school:stoichiometry',
      'school:enthalpy',
      'school:entropy-gibbs',
      'school:kinetics',
      'school:industrial-equilibrium',
      'school:redox-balance',
      'school:galvanic-cells',
      'school:electrolysis',
      'school:analytical-methods',
      'school:halogens',
      'school:groups-one-two',
      'school:group-fourteen',
      'school:yield-calculations',
      'school:nitrogen-industry',
      'school:nitrogen-environment',
      'school:sulfur-oxides',
      'school:sulfuric-process',
      'school:acid-base-ph',
      'school:buffers',
      'school:titration',
      'school:metallurgy',
      'school:electroplating',
      'school:recycling',
      'school:transition-complexes',
      'school:nanomaterials',
      'school:green-chemistry') then true
    when k like 'uni:%' then exists (
      select 1 from public.content_items i where i.id::text=substr(k,5)
      and i.area='university' and i.is_published
      and (i.path like '/universitet/ozin-ozi-daiyndau/%' or i.path like '/universitet/teoriya/%'))
    when k like 'lecture:%' then exists (
      select 1 from public.content_resources r join public.content_items i on i.id=r.item_id
      where r.id::text=substr(k,9) and i.area='university' and i.is_published and i.path='/universitet/teoriya')
    else false end
$$;
revoke all on function public.exit_topic_exists(text) from public,anon,authenticated;
alter table public.bridge_exits drop constraint bridge_exits_lesson_check;
alter table public.bridge_exits add constraint bridge_exits_lesson_check check(lesson in ('bond','equivalent') or lesson ~ '^(uni|school|lecture):[a-zA-Z0-9_-]+$');
create or replace function public.exit_check_topic() returns trigger language plpgsql set search_path='' as $$
begin
 if not public.exit_topic_exists(new.lesson) then raise exception 'unknown_reflection_topic'; end if;
 return new;
end $$;
revoke all on function public.exit_check_topic() from public,anon,authenticated;
create trigger exit_known_topic before insert or update of lesson on public.bridge_exits for each row execute function public.exit_check_topic();
commit;
