import test from 'node:test';import assert from 'node:assert/strict';import {LABS10} from '../guided-lab-10-data.js';import {SCHOOL_UNITS} from '../school-curriculum.js';import {scene10} from '../guided-lab-10-scene.js';import {fresh,completeStep,validRecord} from '../guided-lab-model.js';
const at=(kind,n)=>{const l=LABS10.find(l=>l.kind===kind);return scene10(l,{...fresh(l),tools:l.tools,index:n},null);};
test('eleven grade ten practicals have valid curriculum links and resumable bounded reports',()=>{
 assert.equal(LABS10.length,11);assert.equal(new Set(LABS10.map(l=>l.id)).size,11);
 for(const l of LABS10){assert.ok(SCHOOL_UNITS.some(u=>u.grade===10&&u.slug===l.topic));assert.match(l.source,/авторлық/);
 let r=fresh(l);assert.throws(()=>completeStep(l,r,0),/missing_tools/);r.tools=[...l.tools];const initial=scene10(l,r,null);
 for(let n=0;n<l.steps.length;n++){assert.throws(()=>completeStep(l,r,n+1),/step_order/);r=completeStep(l,r,n);r.notes[n]='Құрал көрсеткішін өзім жазып, бақылау үлгісімен салыстырдым.';}
 r.finished=true;r.conclusion='Бақылаулар мен есептеулерге сүйенген ғылыми қорытынды.';assert.equal(validRecord(l,r).finished,true);assert.notEqual(scene10(l,r,null),initial);
 assert.equal(validRecord(l,{...r,notes:[]}).finished,false);
 }
});
test('model measurements satisfy gas stoichiometry, calorimetry and Faraday law',()=>{
 const gas=LABS10.find(l=>l.kind==='gas').measurements,n=gas.massMg/gas.molarMassMg;
 assert.ok(gas.acidMolarity*gas.acidVolumeMl/1000>2*n);
 const theory=n*8.314462618*gas.temperatureK/gas.pressureKPa*1000;
 assert.ok(theory>24.4&&theory<24.6);assert.ok(gas.gasMl/theory<1&&gas.gasMl/theory>.97);
 const c=LABS10.find(l=>l.kind==='calorimetry').measurements,q=c.massSolutionG*c.heatCapacity*(c.finalC-c.initialC),dh=-q/(c.volumeEachMl/1000*c.molarity)/1000;
 assert.ok(dh<-56&&dh>-58);
 const e=LABS10.find(l=>l.kind==='electrolysis').measurements,deposit=e.molarMassCu*e.currentA*e.reactionSeconds/(e.electrons*e.faraday);
 assert.ok(Math.abs(e.cathodeFinalG-e.initialG-deposit)<.0006);assert.equal(Number((e.cathodeFinalG+e.anodeFinalG).toFixed(3)),2*e.initialG);
 const tit=LABS10.find(l=>l.kind==='titration').measurements;assert.ok(Math.abs(tit.titrantM*(tit.finalMl-tit.initialMl)*tit.ratio/tit.aliquotMl-.1005)<1e-9);
 const paper=LABS10.find(l=>l.kind==='chromatography').measurements;assert.deepEqual(paper.spotsMm.map(x=>x/paper.frontMm),[.3,.6,.8]);
});
test('apparatus and observations distinguish electrolysis, titration and chromatography stages',()=>{
 assert.doesNotMatch(at('electrolysis',4),/cg-bubble/);assert.match(at('electrolysis',5),/5,040/);assert.match(at('electrolysis',5),/4,960/);
 assert.doesNotMatch(at('titration',5),/fill="#eacbd7"/);assert.match(at('titration',6),/fill="#eacbd7"/);assert.match(at('titration',6),/10.05 мл/);
 assert.match(at('galvanic',5),/1,10 V/);assert.match(at('galvanic',6),/Тіркелген кернеу/);
 assert.match(at('gas',5),/24.0 мл/);assert.match(at('kinetics',5),/24.5 мл/);
 const paper=at('chromatography',7),baseline=Number(paper.match(/data-baseline d="M330 (\d+)/)[1]),surface=Number(paper.match(/data-solvent-surface d="M240 (\d+)/)[1]),front=Number(paper.match(/data-solvent-front d="M332 (\d+)/)[1]);
 assert.ok(front<baseline&&baseline<surface);
 const spots=[...paper.matchAll(/<ellipse cx="380" cy="(\d+)" rx="16"/g)].map(m=>Number(m[1]));
 assert.equal(spots.length,3);assert.ok(spots.every(y=>front<y&&y<baseline));
});