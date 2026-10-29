import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {visualCards,renderSchoolVisual} from '../school-visuals.js';
test('all 71 lessons in grades 7–11 have specific illustrations with captions and valid local SVG references',()=>{
 for(const u of SCHOOL_UNITS){
  const cards=visualCards(u),html=renderSchoolVisual(u);
  assert.ok(cards.length>=2&&cards.length<=3,u.slug);
  assert.equal((html.match(/<svg /g)||[]).length,cards.length);
  assert.equal((html.match(/<title /g)||[]).length,cards.length);
  assert.equal((html.match(/<desc /g)||[]).length,cards.length);
  const ids=[...html.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'duplicate SVG ids '+u.slug);
  for(const m of html.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(m[1]),m[1]);
  for(const c of cards){assert.ok(c.title&&c.text.length>20&&c.formula,u.slug);assert.ok(html.includes(c.kind));}
  assert.doesNotMatch(html,/NaN|undefined|<script|<image|https?:/);
 }
});
test('topic-specific science distinguishes isotopes, ions, allotropes, geometry and industrial processes',()=>{
 const c=slug=>visualCards(SCHOOL_UNITS.find(u=>u.slug===slug));
 assert.deepEqual(c('states-changes').map(x=>x.kind),['solid','liquid','gas']);
 assert.deepEqual(c('oxygen-ozone').map(x=>x.kind),['oxygen','ozone']);
 assert.match(c('structure-isotopes')[1].formula,/6p⁺ \+ 8n⁰/);
 const isotope=renderSchoolVisual(SCHOOL_UNITS.find(u=>u.slug==='structure-isotopes'));
 // Both isotope nuclei have six protons; total neutrons are 6 + 8.
 assert.equal((isotope.match(/>p<\/text>/g)||[]).length,12);
 assert.equal((isotope.match(/>n<\/text>/g)||[]).length,14);
 assert.deepEqual(c('bonding-geometry').map(x=>x.formula),['sp · 180°','sp² · 120°','sp³ · 109,5°']);
 assert.match(c('sulfuric-process')[0].formula,/2SO₂ \+ O₂ ⇌ 2SO₃/);
 assert.equal(c('analytical-methods')[0].kind,'chromatography');
 assert.equal(c('carbon')[1].kind,'carbonate');
 assert.equal(c('ionic-reactions')[0].kind,'precipitate-ions');
 assert.equal(c('galvanic-cells')[1].kind,'cell-ions');
 assert.match(c('electrolytes')[1].text,/иондар тасымалдайды/);
});
test('new illustrations replace only Understanding art and ship in the production build',()=>{
 const school=readFileSync(new URL('../school.js',import.meta.url),'utf8');
 assert.match(school,/if\(tab==='understand'\)content=.*renderSchoolVisual\(u\)/);
 assert.doesNotMatch(school,/if\(tab==='understand'\)content=.*labSvg\(labModel\(u\)\)/);
 assert.ok(readFileSync(new URL('../build.mjs',import.meta.url),'utf8').includes('"school-visuals.js"'));
 assert.ok(readFileSync(new URL('../school.css',import.meta.url),'utf8').includes('.school-visual-grid'));
});
