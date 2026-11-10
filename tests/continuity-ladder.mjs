import {BOOK_READINGS,bookReading,readingId} from '../bridge-book.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {bridgeModuleView,CONTINUITY_LADDERS,continuityView,teacherHome} from '../teacher-journey.js';
import {SCHOOL_UNITS} from '../school-curriculum.js';
test('eight continuity routes have valid school anchors, explicit progression and source limits',()=>{
 assert.equal(CONTINUITY_LADDERS.length,8);
 assert.equal(new Set(CONTINUITY_LADDERS.map(t=>t.id)).size,8);
 for(const t of CONTINUITY_LADDERS){
  assert.equal(t.steps.length,4);
  for(const step of t.steps.filter(s=>Number.isInteger(s[0])))assert.ok(SCHOOL_UNITS.some(u=>u.grade===step[0]&&u.slug===step[1]),t.id);
  assert.match(t.lecture,/^\d+(?:–\d+)?$/);
  for(const k of ['change','shared','difference','gap'])assert.ok(t[k].length>25,k);
  assert.equal(t.steps[2][0],'bridge');assert.equal(t.steps[3][0],'uni');
 }
 const html=continuityView();
 assert.match(html,/8\.1\.4\.1/);assert.match(html,/тәуелсіз сарапшы растаған жоқ/);
 assert.match(html,/KazNEB/);
 assert.match(html,/Баешова/);assert.match(html,/барлық тарауы бойынша салыстыру әлі жасалмаған/);
 assert.match(teacherHome({}),/Білім баспалдағын ашу/);
 assert.doesNotMatch(teacherHome({}),/data-cb-topic/);
 assert.match(bridgeModuleView(),/Сабақтастық көпірі/);
 assert.match(bridgeModuleView(),/Нақты не күрделенеді/);
 assert.match(bridgeModuleView(),/Жаңа деңгейдің айырмасы/);
});

test('microlearning provides verified print/PDF references and unique remediation targets',()=>{
 assert.deepEqual(Object.keys(BOOK_READINGS),CONTINUITY_LADDERS.map(t=>t.id));
 const expected={bond:[84,81],atom:[49,46],equivalent:[20,17],solutions:[142,139],redox:[195,192],periodic:[70,67],equilibrium:[129,126],acidbase:[164,161]};
 for(const t of CONTINUITY_LADDERS){
  const r=BOOK_READINGS[t.id];assert.equal(r.notes.length,4);
  assert.deepEqual(r.refs[0].slice(1),expected[t.id]);
  for(const [title,print,pdf] of r.refs){assert.ok(title.length>5);assert.ok(print>0&&pdf>0);assert.ok(bookReading(t.id,3).includes('PDF: '+pdf+'-бет'));}
  for(let i=0;i<4;i++){assert.ok(r.notes[i].length<650);assert.equal(readingId(t.id,i),'cb-reading-'+t.id+'-'+i);}
 }
 const html=continuityView();
 for(let i=0;i<4;i++)assert.ok(html.includes('id="'+readingId('bond',i)+'"'));
 assert.match(html,/Пірәлиев/);assert.match(html,/Кітап: 84-бет/);assert.match(html,/PDF: 81-бет/);
});


test('all eight comparisons cite checked school and university interior pages and distinguish consolidation',async()=>{
 const {TEXTBOOK_COMPARISONS:c,EVIDENCE_BOOKS,stepEvidence,textbookComparison,evidenceOverview}=await import('../bridge-evidence.js');
 assert.deepEqual(Object.keys(c),CONTINUITY_LADDERS.map(t=>t.id));
 const expected={
  bond:[[128],[56,59],[84]],atom:[[49],[25,32],[46,49,50]],
  equivalent:[[55],[92],[20]],solutions:[[142],[60],[149,150]],
  redox:[[69],[181],[206,207]],periodic:[[80,84],[42],[74,75]],
  equilibrium:[[56],[159],[129,130]],acidbase:[[68],[45,49],[164,165]]
 };
 for(const [id,t] of Object.entries(c)){
  assert.deepEqual(['school','upper','university'].map(k=>t[k].refs[0].pages),expected[id]);
  for(const key of ['school','upper','university']){
   assert.ok(t[key].claim.length>30);
   for(const ref of t[key].refs){
    assert.ok(EVIDENCE_BOOKS[ref.book]);
    assert.match(ref.paragraph,/§\d/);
    assert.equal(ref.pages.length,ref.pdf.length);
    for(let i=0;i<ref.pages.length;i++){assert.ok(Number.isInteger(ref.pages[i])&&ref.pages[i]>0);assert.equal(ref.pages[i]-ref.pdf[i],ref.book==='uni'?3:0);}
    assert.ok(textbookComparison(id).includes('Кітап: '+ref.pages.join(', ')+'-бет'));
    assert.ok(textbookComparison(id).includes('PDF: '+ref.pdf.join(', ')+'-бет'));
   }
  }
  for(const step of [0,1,3])assert.match(stepEvidence(id,step),/Дәлелі: параграф және бет/);
  assert.equal(stepEvidence(id,2),'','author bridge is not passed off as a textbook excerpt');
  assert.ok(t.conclusion.length>80);assert.ok(t.overlap.length>60);
  assert.match(textbookComparison(id),/Авторлық өтпелі тапсырма/);
 }
 assert.deepEqual(Object.entries(c).filter(([,v])=>v.kind==='consolidation').map(([k])=>k),['periodic','equilibrium']);
 assert.match(c.atom.overlap,/Квант/);assert.match(c.redox.overlap,/мектептің/);
 assert.match(c.acidbase.university.claim,/белсенділік/);
 assert.match(evidenceOverview(CONTINUITY_LADDERS),/барлық оқулықтың толық сараптамасы емес/);
 assert.match(evidenceOverview(CONTINUITY_LADDERS),/сабақтастықтың пайызы/);
 const html=continuityView();assert.match(html,/data-cb-evidence="bond"/);
 assert.equal((html.match(/class="cb-step-source"/g)||[]).length,3);
 assert.match(html,/8 тақырып бойынша жалпы қорытынды/);
});
