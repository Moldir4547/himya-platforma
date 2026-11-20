import test from 'node:test';
import assert from 'node:assert/strict';
import {SCHOOL_UNITS} from '../school-curriculum.js';
import {quest,missions,handIn,directory} from '../worksheet-quests.js';
test('all topic quests contain a unique practical case, four stations and photo controls',()=>{
 assert.deepEqual(Object.keys(missions).sort(),SCHOOL_UNITS.map(u=>u.slug).sort());
 assert.equal(new Set(Object.values(missions)).size,SCHOOL_UNITS.length);
 for(const u of SCHOOL_UNITS){const page=quest(u,['','Болжам жаса']);
 assert.equal((page.match(/БЕКЕТ /g)||[]).length,4);assert.ok(page.includes(missions[u.slug]));assert.ok(!page.includes('undefined'));
 assert.match(handIn(u,{id:'student'}),/capture="environment"/);assert.match(handIn(u,{id:'student'}),/data-gallery/);
 assert.doesNotMatch(handIn(u,null),/type="file"/);assert.ok(directory([u]).includes(u.path+'#worksheet'));}
});
