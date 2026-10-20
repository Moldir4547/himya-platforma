import test from 'node:test';
import assert from 'node:assert/strict';
import { sortLectureResources } from '../platform-utils.js';
import { LocalApiStore, SupabaseStore } from '../store.js';

test('lectures use numeric order and preserve unrelated materials and source array', () => {
  const rows = [
    {id:'7',filename:'Дәріс №7. Байланыстар.pptx'},
    {id:'notes',filename:'Силлабус.pdf'},
    {id:'15',filename:'Дәріс №15 Тотығу.pptx'},
    {id:'2',filename:'Дәріс №2. Заңдар.pptx'},
    {id:'1',filename:'Дәріс №1. Кіріспе.pptx'},
    {id:'10',filename:'Дәріс №10. Кинетика.pptx'},
  ];
  const before = JSON.stringify(rows);
  assert.deepEqual(sortLectureResources(rows).map(r=>r.id), ['1','notes','2','7','10','15']);
  assert.equal(JSON.stringify(rows), before);
});
test('titles are supported, equal numbers stay stable, other numbers are ignored', () => {
  const rows = [{title:'Дәріс №3. Тақырып',id:'3a'}, {filename:'7-сынып.pdf',id:'school'}, {filename:'Дәріс №1. Кіріспе',id:'1'}, {filename:'Дәріс №3. Жалғасы',id:'3b'}];
  assert.deepEqual(sortLectureResources(rows).map(r=>r.id), ['1','school','3a','3b']);
  assert.deepEqual(sortLectureResources([]), []);
});
for (const Store of [LocalApiStore, SupabaseStore]) {
  test(Store.name + ' returns resources in lecture order', async () => {
    const store = new Store('https://example.test', 'public-key');
    store.validSession = async () => null;
    store.request = async () => [{filename:'Дәріс №12. Тақырып'}, {filename:'Дәріс №2. Тақырып'}];
    assert.deepEqual((await store.listResources('lectures')).map(r=>r.filename), ['Дәріс №2. Тақырып', 'Дәріс №12. Тақырып']);
  });
}
