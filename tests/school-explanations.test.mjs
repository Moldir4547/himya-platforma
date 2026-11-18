import test from 'node:test';
import assert from 'node:assert/strict';
import {EXPLANATIONS, renderSchoolExplanation} from '../school-explanations.js';
import {SCHOOL_UNITS} from '../school-curriculum.js';

test('every school topic has a distinct complete explanation and feedback', () => {
  assert.equal(SCHOOL_UNITS.length, 71);
  assert.deepEqual(Object.keys(EXPLANATIONS).sort(), SCHOOL_UNITS.map(u => u.slug).sort());
  const situations = new Set();
  for (const unit of SCHOOL_UNITS) {
    const entry = EXPLANATIONS[unit.slug];
    assert.equal(entry.length, 5, unit.slug);
    assert.ok(entry.every(x => typeof x === 'string' && x.trim().length > 25), unit.slug);
    situations.add(entry[0]);
    const html = renderSchoolExplanation(unit);
    assert.ok(html.includes('<details><summary>Жауабымды салыстыру</summary>'), unit.slug);
    assert.ok(!/<(?:script|iframe|input|form)\b/i.test(html), unit.slug);
  }
  assert.equal(situations.size, 71);
});

test('unknown topics add nothing; content is escaped before rendering', () => {
  assert.equal(renderSchoolExplanation({slug:'missing'}), '');
  EXPLANATIONS.test = Array(5).fill('<img src=x onerror=alert(1)>');
  try {
    const html = renderSchoolExplanation({slug:'test'});
    assert.ok(html.includes('&lt;img'));
    assert.ok(!html.includes('<img'));
  } finally { delete EXPLANATIONS.test; }
});

test('school mount is limited to understanding and the module is published', async () => {
  const {readFile} = await import('node:fs/promises');
  const school = await readFile(new URL('../school.js', import.meta.url), 'utf8');
  const build = await readFile(new URL('../build.mjs', import.meta.url), 'utf8');
  assert.ok(school.includes("if(tab==='understand')content=schoolOpeningQuestion(u)+renderSchoolExplanation(u)"));
  assert.ok(build.includes('"school-explanations.js"'));
  assert.ok(school.includes('schoolLifeTheory(u)'));
  assert.ok(school.includes("teacherMaterials(u,'presentation')"));
  assert.ok(school.includes("teacherMaterials(u,'worksheet')"));
});
