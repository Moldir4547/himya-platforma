import test from 'node:test';
import assert from 'node:assert/strict';
import {TOPICS} from '../teacher-games-data.js';
import {crossword,letters} from '../teacher-crossword.js';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {teacherRoute} from '../teacher-materials.js';
test('every curriculum lesson has a playable crossword and a numerical challenge',()=>{
 assert.deepEqual(TOPICS.filter(t=>t.level==='school').map(t=>t.id),SCHOOL_UNITS.map(u=>u.slug));
 assert.equal(TOPICS.filter(t=>t.level==='university').length,15);
 assert.equal(new Set(TOPICS.map(t=>t.id)).size,TOPICS.length);
 for(const t of TOPICS){
  assert.equal(new Set(t.terms.map(([w])=>letters(w))).size,3,t.id);
  assert.ok(t.terms.every(([w,clue])=>w&&clue),t.id);
  const g=crossword(t.terms),cells=new Map();assert.ok(g,t.id);
  for(const w of g.words)Array.from(w.word,(l,i)=>{const id=[w.x+(w.horizontal?i:0),w.y+(w.horizontal?0:i)].join(',');const c=cells.get(id);assert.ok(!c||c.letter===l,t.id);cells.set(id,{letter:l,count:(c?.count||0)+1});});
  assert.ok([...cells.values()].filter(c=>c.count>1).length>=2,t.id);
  assert.ok(t.tasks.some(([q,n,,why])=>q&&Number.isFinite(n)&&why),t.id);
 }
});
test('teacher catalog links to the HTML game bank with the selected level',()=>{
 const ctx={state:{items:[],allResources:[]},shell:x=>x};
 assert.match(teacherRoute('/mugalim-materialdary',ctx),/href="teacher-games\.html"/);
 assert.match(teacherRoute('/mugalim-materialdary/ustaz',ctx),/teacher-games\.html\?level=school/);
 assert.match(teacherRoute('/mugalim-materialdary/oqytushy',ctx),/teacher-games\.html\?level=university/);
});
