import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CONTROL_QUESTIONS as qs,CONTROL_TOPICS,CONTROL_DURATION_SECONDS,remainingSeconds,reviewControl} from '../university-control-data.js';
test('30 unique questions cover all seven requested topics with valid explanations',()=>{
 assert.equal(qs.length,30);assert.equal(new Set(qs.map(q=>q.id)).size,30);assert.equal(CONTROL_DURATION_SECONDS,1800);
 for(const [id,,count] of CONTROL_TOPICS)assert.equal(qs.filter(q=>q.topic===id).length,count);
 for(const q of qs){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(Number.isInteger(q.correct_index)&&q.correct_index>=0&&q.correct_index<4);assert.ok(q.explanation.length>50);assert.ok(q.reference);}
 assert.deepEqual(JSON.parse(readFileSync(new URL('../university-control-bank.json',import.meta.url),'utf8')),qs);
});
test('deadline is absolute across reloads; blank answers are incorrect',()=>{
 const end='2026-10-20T01:30:00Z';
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:00:00Z')),1800);
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:20:00Z')),600);
 assert.equal(remainingSeconds(end,Date.parse('2026-10-20T01:31:00Z')),0);
 assert.equal(reviewControl(qs,qs.map(q=>q.correct_index)).filter(q=>q.correct).length,30);
 assert.equal(reviewControl(qs,Array(30).fill(-1)).filter(q=>q.correct).length,0);
});
test('calculation keys are independently checked',()=>{
 const answer=n=>qs[n-1].options[qs[n-1].correct_index];
 assert.equal(answer(6),'0,50 моль');assert.equal(answer(9),'49 г/моль-экв');assert.equal(answer(10),'98 г/моль-экв');
 assert.equal(answer(11),'12 г/моль-экв');assert.equal(answer(17),'65 г/моль');assert.equal(answer(20),'2,24 л');assert.equal(answer(22),'80%');
});
