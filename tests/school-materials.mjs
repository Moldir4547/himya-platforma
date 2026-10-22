import test from 'node:test';import assert from 'node:assert/strict';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {matchesTopic,schoolFileMaterials,worksheetIntro,worksheetEnd,CLASS_CARDS} from '../school-materials.js';
const unit=slug=>SCHOOL_UNITS.find(u=>u.slug===slug);
test('existing teacher slide and worksheet filenames map to their lesson topics',()=>{
const cases=[
 ['safety-mixtures','7 сынып. Химия пәніне кіріспе слайд.pptx'],
 ['states-changes','7 сынып. Заттардың агрегаттық күйінің өзгеруі.pptx'],
 ['atoms-substances','7 сынып. Атомдар. Молекулалар. Заттар.pptx'],
 ['structure-isotopes','7 сынып. Атомдар. Молекулалар. Заттар.pptx'],
 ['periodic-table','7 сынып. Химиялық элементтердің периодтық кестесі.pptx'],
 ['electrons-ions','Атомдағы электрондардығң қозғалысы слайд.pptx'],
 ['solutions','Ерітінділер және ерігіштік слайд.pptx'],
 ['mole-avogadro','Зат мөлшері слайд.pptx'],
 ['bonding','Химиялық байланыс түрлері слайд.pptx'],
 ['oxides','Бейорганикалық қосылыстардың негізгі кластары. Генетикалық байланыс слайд.pptx'],
 ['equations-conservation','Заттардың формулалары және химиялық реакция теңдеулері слайд.pptx'],
 ['redox','Тотығу тотықсыздану реакциялары слайд.pptx'],
 ['kinetics','Кинетика слайд.pptx'],
 ['acid-base-ph','Қышқыл және негіз ерітінділер слайд.pptx']];
for(const [slug,name]of cases)assert.equal(matchesTopic(name,unit(slug),'presentation'),true,name);
assert.equal(matchesTopic('7 сынып. Химиялық элементтердің периодтық кестесі.pptx',unit('atoms-substances'),'presentation'),false);
assert.equal(matchesTopic('Жұмыс парағы. Атомдар мен Молекулалар Заттардың құпиясы.pdf',unit('atoms-substances'),'presentation'),false);
assert.equal(matchesTopic('Жұмыс парағы. Атомдар мен Молекулалар Заттардың құпиясы.pdf',unit('atoms-substances'),'worksheet'),true);
});
test('all 71 worksheets have topic-specific tasks, reference support, paper and assessment sections',()=>{
assert.equal(CLASS_CARDS.length,4);
for(const u of SCHOOL_UNITS){
 const html=worksheetIntro(u,'<svg></svg>')+worksheetEnd(u);
 assert.ok(html.includes(u.life.replaceAll('&','&amp;')),u.slug);
 assert.ok(html.includes('data-worksheet-print'));
 assert.ok(html.includes('1. Негізгі ойды тап'));
 assert.ok(html.includes('2. Өмірмен байланыстыр'));
 assert.ok(html.includes('3. Есепте және тексер'));
 assert.ok(html.includes('data-school-tab="understand"'));
}
assert.match(worksheetIntro(unit('salts-genetic'),''),/Карбонаттар мен сульфаттар — тұздардың түрлері/);
assert.doesNotMatch(worksheetIntro({...unit('safety-mixtures'),title:'<script>alert(1)</script>'},''),/<script>/);
});

test('presentation panels contain only published slide files, with grade/topic isolation and original actions',()=>{
 const items=[{id:'g7',path:'/mektep/teoriya/7-synyp',is_published:true},{id:'g8',path:'/mektep/teoriya/8-synyp',is_published:true},{id:'child',parent_id:'g7',title:'Атомдар',is_published:true},{id:'hidden',parent_id:'g7',is_published:false}];
 const file=(id,filename,extra={})=>({id,item_id:'child',filename,...extra});
 const files=[file('slide','Атомдар.pptx'),file('theory','Атомдар теория.pdf'),file('pdf-slide','Атомдар.pdf',{category:'Презентация'}),file('doc','Атомдар.docx'),file('sheet','Жұмыс парағы Атомдар.pdf'),file('draft','Атомдар.pptx',{is_published:false}),file('other-grade','Атомдар.pptx',{item_id:'g8'}),file('hidden-parent','Атомдар.pptx',{item_id:'hidden'}),file('slide','Атомдар.pptx')];
 const html=schoolFileMaterials(items,files,7,unit('atoms-substances'));
 assert.equal((html.match(/class="resource-card"/g)||[]).length,2);
 assert.match(html,/data-open-resource="slide"/);
 assert.match(html,/data-download-resource="pdf-slide"/);
 for(const id of ['theory','doc','sheet','draft','other-grade','hidden-parent'])assert.doesNotMatch(html,new RegExp('data-open-resource="'+id+'"'));
 assert.equal(matchesTopic('Атомдар.pdf',unit('atoms-substances'),'presentation'),false);
 assert.equal(matchesTopic('Атомдар презентация.pdf',unit('atoms-substances'),'presentation'),true);
 assert.equal(matchesTopic('Атомдар.pdf',unit('atoms-substances'),'presentation',{category:'Презентация'}),true);
 assert.doesNotMatch(html,/<iframe|<svg|<form|school-notes/);
});

test('worksheet panels contain only uploaded worksheet files and preserve file actions',()=>{
 const items=[{id:'g7',path:'/mektep/teoriya/7-synyp'},{id:'g8',path:'/mektep/teoriya/8-synyp'},{id:'hidden',parent_id:'g7',is_published:false}];
 const file=(id,filename,extra={})=>({id,item_id:'g7',filename,...extra});
 const files=[file('sheet','Жұмыс парағы Атомдар.pdf'),file('sheet','Жұмыс парағы Атомдар.pdf'),file('slide','Атомдар.pptx'),file('theory','Атомдар теория.pdf'),file('video','Атомдар.mp4'),file('draft','Жұмыс парағы Атомдар.pdf',{is_published:false}),file('other','Жұмыс парағы Атомдар.pdf',{item_id:'g8'}),file('hidden','Жұмыс парағы Атомдар.pdf',{item_id:'hidden'})];
 for(const topic of [null,unit('atoms-substances')]){
  const html=schoolFileMaterials(items,files,7,topic,'worksheet');
  assert.equal((html.match(/class="resource-card"/g)||[]).length,1);
  assert.match(html,/data-open-resource="sheet"/);
  assert.match(html,/data-download-resource="sheet"/);
  for(const id of ['slide','theory','video','draft','other','hidden'])assert.doesNotMatch(html,new RegExp('data-open-resource="'+id+'"'));
  assert.doesNotMatch(html,/<form|<svg|<textarea|ws-reference|data-school-answer|data-worksheet-print/);
 }
 const empty=schoolFileMaterials(items,files,7,unit('oxides'),'worksheet');
 assert.match(empty,/school-file-empty/);
 assert.doesNotMatch(empty,/resource-card|<form|<svg/);
});
