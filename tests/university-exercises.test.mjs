import test from 'node:test';
import assert from 'node:assert/strict';
import {BOOKS,MODULES,checkNumber} from '../university-exercises-data.js';
test('each topic has distinct example, practice and traceable book assignment',()=>{
 assert.equal(MODULES.length,12);
 assert.equal(new Set(MODULES.map(m=>m.id)).size,12);
 assert.deepEqual(new Set(MODULES.map(m=>m.homework.book)),new Set(Object.keys(BOOKS)));
 for(const m of MODULES){
  assert.ok(m.pages.some(([book])=>book===m.homework.book));
  assert.ok(Number.isInteger(m.homework.page));
  assert.notEqual(m.example.prompt,m.practice.prompt);
  for(const t of [m.example,m.practice,m.homework])assert.ok(t.answer&&t.steps.every(([step,why])=>step&&why));
  for(const t of [m.practice,m.homework]){
   const [value,tol]=t.check;
   assert.equal(checkNumber(String(value).replace('.',','),value,tol),true);
   assert.equal(checkNumber(String(value+tol+1),value,tol),false);
  }
 }
});
test('numerical checks match independent calculations and reject units and blank answers',()=>{
 const check=id=>MODULES.find(m=>m.id===id).homework.check;
 const eqs={gas:720*912*273.15/(760*288.15),equiv:.78*.08206*298.15/((745/760)*.304),stoich:.84/22.4*100/30*100,solutions:10*249.68/159.61};
 for(const [id,v] of Object.entries(eqs))assert.equal(checkNumber(v,...check(id)),true,id);
 assert.equal(checkNumber('',0,1),null);
 assert.equal(checkNumber('42 мл',42,0),null);
 assert.equal(checkNumber('4,11',4.105,.03),true);
});
