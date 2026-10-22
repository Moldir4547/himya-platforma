import test from 'node:test';
import assert from 'node:assert/strict';
import {teacherEntries,teacherRoute,teacherPisaSection,TEACHER_PATH} from '../teacher-materials.js';
const items=[
 {id:'s',area:'school',path:'/mektep',title:'Мектеп',is_published:true},
 {id:'u',area:'university',path:'/universitet',title:'ЖОО',is_published:true},
 {id:'g',parent_id:'s',path:'/mektep/teoriya/7-synyp',title:'7-сынып',is_published:true},
 {id:'l',parent_id:'u',path:'/universitet/lecture',title:'Дәріс',is_published:true},
 {id:'hidden',parent_id:'u',is_published:false},
 {id:'child',parent_id:'hidden',area:'university',is_published:true},
 {id:'bridge',area:'bridge',is_published:true},
 {id:'orphan',parent_id:'missing',area:'school',is_published:true},
 {id:'cycle',parent_id:'cycle',area:'school',is_published:true}
];
const resources=[
 {id:'school',item_id:'g',filename:'Атом.pptx'},
 {id:'university',item_id:'l',filename:'Силлабус.pdf'},
 {id:'university',item_id:'l',filename:'Силлабус.pdf'},
 {id:'draft',item_id:'g',filename:'Жасырын.pdf',is_published:false},
 ...['child','bridge','orphan','cycle'].map(id=>({id,item_id:id,filename:id+'.pdf'}))
];
test('material groups inherit parents and exclude hidden, bridge, orphan, cycles and duplicate IDs without mutating records',()=>{
 const before=JSON.stringify({items,resources}),entries=teacherEntries(items,resources);
 assert.deepEqual(entries.map(e=>[e.row.id,e.area]),[['school','school'],['university','university']]);
 assert.equal(JSON.stringify({items,resources}),before);
});
test('two directions keep original open/download IDs and group isolation',()=>{
 const ctx={state:{items,allResources:resources,user:{role:'student'}},shell:s=>s};
 assert.equal((teacherRoute(TEACHER_PATH,ctx).match(/class="teacher-direction"/g)||[]).length,2);
 assert.match(teacherRoute(TEACHER_PATH+'/oqytushy',ctx),/data-open-resource="university"/);
 assert.doesNotMatch(teacherRoute(TEACHER_PATH+'/oqytushy',ctx),/data-open-resource="school"/);
 assert.match(teacherRoute(TEACHER_PATH+'/ustaz',ctx),/data-download-resource="school"/);
 assert.equal(teacherRoute(TEACHER_PATH+'/unknown',ctx),null);
 assert.match(teacherRoute(TEACHER_PATH+'/ustaz',{...ctx,state:{...ctx.state,allResources:[{id:'x',item_id:'g',filename:'<script>.pdf'}]}}),/&lt;script&gt;/);
});

test('published legacy PISA pages appear in teacher home and school direction without copying content',()=>{
 const legacy={id:'pisa',parent_id:'s',path:'/mektep/interaktivti-zhane-innovaciyalyq-tapsyrmalar',title:'Интерактивті және инновациялық тапсырмалар',is_published:true,body:'<p>Original cases</p>'};
 const input=[...items,legacy,{id:'draft-pisa',parent_id:'s',title:'PISA draft',path:'/hidden-pisa',is_published:false},{id:'nested-pisa',parent_id:'hidden',title:'PISA hidden ancestor',path:'/nested-pisa',is_published:true},{id:'bridge-pisa',parent_id:'bridge',title:'PISA bridge',path:'/bridge-pisa',is_published:true}];
 const before=JSON.stringify(input),ctx={state:{items:input,allResources:resources},shell:x=>x};
 for(const path of [TEACHER_PATH,TEACHER_PATH+'/ustaz']){
  const html=teacherRoute(path,ctx);
  assert.match(html,/id="pisa"/);
  assert.ok(html.includes('href="/mektep/interaktivti-zhane-innovaciyalyq-tapsyrmalar"'));
  assert.doesNotMatch(html,/Original cases|hidden-pisa|nested-pisa|bridge-pisa/);
 }
 assert.doesNotMatch(teacherRoute(TEACHER_PATH+'/oqytushy',ctx),/id="pisa"/);
 assert.equal(teacherPisaSection(items),'');
 assert.equal(JSON.stringify(input),before);
});
