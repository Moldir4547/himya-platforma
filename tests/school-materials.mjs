import test from 'node:test';import assert from 'node:assert/strict';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {matchesTopic,worksheetIntro,worksheetEnd,CLASS_CARDS} from '../school-materials.js';
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
assert.equal(matchesTopic(cases[3][1],unit('atoms-substances'),'presentation'),false);
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
