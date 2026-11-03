import test from 'node:test';
import assert from 'node:assert/strict';
import {createUniversityControl} from '../university-control.js';
test('failed learning-card load stays readable and stops automatic retry loops',async()=>{
 let requests=0,renders=0,html='',control;
 const state={user:{id:'reader',role:'admin'},items:[],progress:[]};
 control=createUniversityControl({state,shell:x=>x,store:{async listCurrentControlAttempts(){requests++;throw Error('offline');}},render:()=>{renders++;if(renders<3)html=control.route('/universitet/bilim-kartasy');}});
 html=control.route('/universitet/bilim-kartasy');
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(requests,1);assert.equal(renders,1);
 assert.match(html,/Нәтижелер жүктелмеді: offline/);
 assert.match(html,/data-control-load/);
});
