import test from 'node:test';
import assert from 'node:assert/strict';
import {TABLE,SYMBOLS,ELEMENTS,PRACTICE,evaluate} from '../electron-shells-data.js';
test('all 118 table cells and 118 configurations preserve atomic numbers',()=>{
 assert.equal(TABLE.every(r=>r.cells.length===18),true);
 assert.deepEqual(TABLE.flatMap(r=>r.cells).filter(n=>Number.isInteger(n)&&n>0).sort((a,b)=>a-b),SYMBOLS.map((_,i)=>i+1));
 assert.equal(PRACTICE.length,118);
 for(const e of ELEMENTS){
  assert.equal(e.shells.reduce((a,b)=>a+b),e.z);
  assert.equal(e.shells.length,e.period);
  assert.ok(evaluate(e,e.shells.map(String)).every(Boolean));
  assert.equal(evaluate(e,Array(e.period).fill('')),null);
 }
});
test('exceptional configurations do not assign an artificial outer electron',()=>{
 for(const [z,shells] of [[24,[2,8,13,1]],[29,[2,8,18,1]],[41,[2,8,18,12,1]],[44,[2,8,18,15,1]],[45,[2,8,18,16,1]],[46,[2,8,18,18,0]],[47,[2,8,18,18,1]],[54,[2,8,18,18,8]],[58,[2,8,18,19,9,2]],[78,[2,8,18,32,17,1]],[103,[2,8,18,32,32,8,3]],[118,[2,8,18,32,32,18,8]]])assert.deepEqual(ELEMENTS[z-1].shells,shells);
 assert.deepEqual(evaluate(ELEMENTS[0],['2']),[false]);
});
