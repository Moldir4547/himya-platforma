import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const code=readFileSync(new URL('../school-equation-practice.js',import.meta.url),'utf8');
const {EQUATIONS,checkEquation}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
test('all ten solutions conserve atoms in minimum ratios',()=>{assert.equal(EQUATIONS.length,10);for(const eq of EQUATIONS){assert.equal(checkEquation(eq,eq.key).ok,true);assert.equal(checkEquation(eq,eq.key.map(n=>2*n)).ok,false);}});
test('invalid and unbalanced coefficients are rejected',()=>{const eq=EQUATIONS[0];for(const v of [[1,1,1],[0,1,2],[-2,1,2],[2,.5,2],[NaN,1,2],[Infinity,1,2],[2,1],[100,50,100]])assert.equal(checkEquation(eq,v).ok,false);const r=checkEquation(eq,[1,1,1]);assert.deepEqual(r.counts,[{el:'H',left:2,right:2},{el:'O',left:2,right:1}]);});
