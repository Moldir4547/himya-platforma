import {readFile,writeFile} from 'node:fs/promises';
import {SCHOOL_UNITS,SCHOOL_MODES,schoolQuestions} from '../school.js';
const root=new URL('../',import.meta.url),specs={};
for(const u of SCHOOL_UNITS){specs[u.slug]={grade:u.grade,modes:{}};for(const mode of SCHOOL_MODES)specs[u.slug].modes[mode]=schoolQuestions(u,mode).map(q=>q.open?{open:true}:{key:q.key,...(q.opts?{choices:q.opts.length}:{})});}
const specText=JSON.stringify(specs,null,2),migration=new URL('supabase/migrations/202610180003_school_learning.sql',root),old=await readFile(migration,'utf8');
const inserts=Object.entries(specs).map(([slug,s])=>"insert into public.school_assessment_keys(slug,grade,modes) values('"+slug+"',"+s.grade+",'"+JSON.stringify(s.modes).replaceAll("'","''")+"'::jsonb) on conflict(slug) do update set grade=excluded.grade,modes=excluded.modes;\n").join('');
const updated=old.replace(/-- BEGIN GENERATED SCHOOL KEYS[\s\S]*?-- END GENERATED SCHOOL KEYS/,'-- BEGIN GENERATED SCHOOL KEYS\n'+inserts+'-- END GENERATED SCHOOL KEYS');
if(process.argv.includes('--check')){if(await readFile(new URL('school-assessments.json',root),'utf8')!==specText||updated!==old)throw Error('School assessment specifications are stale: run node scripts/generate-school-specs.mjs');console.log('School assessment keys match JS, Python and SQL.');}else{await writeFile(new URL('school-assessments.json',root),specText);await writeFile(migration,updated);}
