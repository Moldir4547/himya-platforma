import test from 'node:test';
import assert from 'node:assert/strict';
import {EQUATIONS,balanceRows,formulaAtoms} from '../chem-equations.js';

test('each grade has eight distinct equations per level, with minimal positive coefficients',()=>{
 const gcd=(a,b)=>b===0?a:gcd(b,a%b);
 assert.deepEqual(Object.keys(EQUATIONS),['7','8','9','10','11']);
 for(const grade of Object.values(EQUATIONS)){
  assert.equal(new Set([...grade.easy,...grade.hard].map(([eq])=>eq)).size,16);
  for(const tasks of Object.values(grade)){
   assert.equal(tasks.length,8);
   for(const [eq,coeffs] of tasks){
    assert.equal(coeffs.length,eq.split(/[+→]/).length,eq);
    assert.ok(coeffs.every(n=>Number.isInteger(n)&&n>0),eq);
    assert.equal(coeffs.reduce(gcd),1,eq);
    assert.ok(balanceRows(eq,coeffs).every(([,l,r])=>l===r),eq);
   }
  }
 }
});
test('parenthesis multipliers affect every element in the group',()=>{
 assert.deepEqual(Object.fromEntries(formulaAtoms('Al₂(SO₄)₃')),{Al:2,S:3,O:12});
 assert.deepEqual(Object.fromEntries(formulaAtoms('Ca(OH)₂')),{Ca:1,O:2,H:2});
});

