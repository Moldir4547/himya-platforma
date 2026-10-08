import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFile,filterMaterials,errorMessage } from '../platform-utils.js';
import { SupabaseStore } from '../store.js';
let storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
test('file size and extension checks',()=>{for(const name of ['a.pdf','a.doc','a.docx','a.ppt','a.pptx','a.png','a.mp4'])assert.doesNotThrow(()=>validateFile({name,size:40}));for(const file of [null,{name:'a.pdf',size:0},{name:'a.pdf',size:20971521},{name:'a.html',size:1},{name:'a.svg',size:100}])assert.throws(()=>validateFile(file));});
test('Kazakh search and combined filters',()=>{const rows=[{title:'Химиялық байланыс',filename:'a.pdf',type:'pdf',subject:'Химия',category:'Теория'},{title:'Ерітінділер',filename:'b.pptx',type:'ppt',subject:'Химия',category:'Презентация'}];assert.equal(filterMaterials(rows,{query:'  ХИМИЯЛЫҚ ',type:'pdf',category:'Теория'}).length,1);assert.equal(filterMaterials(rows,{query:'жоқ'}).length,0);});
test('publishable API key is never sent as bearer JWT',()=>{assert.equal(new SupabaseStore('https://example.test','sb_publishable_test').headers().Authorization,undefined);});
test('concurrent expired sessions refresh only once',async()=>{storage.clear();const store=new SupabaseStore('https://example.test','key');store.saveSession({access_token:'old',refresh_token:'refresh',expires_at:1});let count=0;store.request=async()=>{count++;await new Promise(r=>setTimeout(r,20));return{access_token:'new',refresh_token:'new-refresh',expires_in:3600};};const sessions=await Promise.all(Array.from({length:8},()=>store.validSession()));assert.equal(count,1);assert.ok(sessions.every(s=>s.access_token==='new'));});
test('invalid refresh clears stale authorization',async()=>{storage.clear();const store=new SupabaseStore('https://example.test','key');store.saveSession({access_token:'old',refresh_token:'refresh',expires_at:1});store.request=async()=>{throw Object.assign(new Error('expired'),{status:400});};assert.equal(await store.validSession(),null);assert.equal(store.session(),null);});
test('email confirmation is a successful pending registration',async()=>{storage.clear();const store=new SupabaseStore('https://example.test','key');store.request=async()=>({user:{id:'id'}});assert.deepEqual(await store.register({displayName:'QA',email:'qa@example.test',password:'12345678',username:'qa_user'}),{confirmationRequired:true});assert.equal(store.session(),null);});
test('login determines role from the verified server profile',async()=>{storage.clear();const store=new SupabaseStore('https://example.test','key');store.request=async()=>({access_token:'token'});store.currentUser=async()=>({id:'id',role:'admin'});assert.equal((await store.login({email:'admin@example.test',password:'test'})).role,'admin');});
test('storage URLs are signed and expire promptly',async()=>{storage.clear();const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>null;store.request=async(path,options)=>{assert.ok(path.includes('/object/sign/'));assert.equal(JSON.parse(options.body).expiresIn,60);return{signedURL:'/object/sign/content-assets/a.pdf?token=signature'};};const url=await store.resourceUrl({storage_path:'a.pdf',filename:'a.pdf'});assert.equal(url,'https://example.test/storage/v1/object/sign/content-assets/a.pdf?token=signature');});
test('errors provide readable feedback',()=>assert.equal(errorMessage('Invalid login credentials'),'Email/логин немесе пароль қате'));

function pending(){let resolve,reject;const promise=new Promise((ok,fail)=>{resolve=ok;reject=fail;});return {promise,resolve,reject};}
test('late token refresh cannot restore an account after logout',async()=>{
 storage.clear();const store=new SupabaseStore('https://example.test','key'),response=pending();
 store.saveSession({access_token:'old',refresh_token:'refresh',expires_at:1});
 store.request=async path=>path.includes('refresh_token')?response.promise:{};
 const refresh=store.validSession();await Promise.resolve();await store.logout();
 response.resolve({access_token:'late',refresh_token:'late-refresh',expires_in:3600});
 assert.equal(await refresh,null);assert.equal(store.session(),null);
});
test('late refresh cannot overwrite a newer account session',async()=>{
 storage.clear();const store=new SupabaseStore('https://example.test','key'),response=pending();
 store.saveSession({access_token:'old',refresh_token:'refresh',expires_at:1});store.request=()=>response.promise;
 const refresh=store.validSession();await Promise.resolve();
 store.saveSession({access_token:'new-account',refresh_token:'new-account-refresh',expires_at:9999999999});
 response.resolve({access_token:'late',refresh_token:'late-refresh',expires_in:3600});
 assert.equal((await refresh).access_token,'new-account');
});
test('late failed refresh does not clear a newer account',async()=>{
 storage.clear();const store=new SupabaseStore('https://example.test','key'),response=pending();
 store.saveSession({access_token:'old',refresh_token:'refresh',expires_at:1});store.request=()=>response.promise;
 const refresh=store.validSession();await Promise.resolve();
 store.saveSession({access_token:'new-account',refresh_token:'new-account-refresh',expires_at:9999999999});
 response.reject(Object.assign(new Error('expired'),{status:400}));
 assert.equal((await refresh).access_token,'new-account');
});
test('logout cancels an in-flight login',async()=>{
 storage.clear();const store=new SupabaseStore('https://example.test','key'),response=pending();store.request=()=>response.promise;
 const login=store.login({email:'qa@example.test',password:'test'});await store.logout();
 response.resolve({access_token:'late'});await assert.rejects(login,/тоқтатылды/);assert.equal(store.session(),null);
});
test('logout response does not clear a later login',async()=>{
 storage.clear();const store=new SupabaseStore('https://example.test','key'),response=pending();store.saveSession({access_token:'old'});
 store.request=path=>path.includes('/logout')?response.promise:Promise.resolve({access_token:'new'});store.currentUser=async()=>({id:'new'});
 const logout=store.logout();await store.login({email:'qa@example.test',password:'test'});response.resolve({});await logout;
 assert.equal(store.session().access_token,'new');
});
test('registration validates required values before contacting Auth',async()=>{
 const store=new SupabaseStore('https://example.test','key');store.request=()=>assert.fail('must not send invalid registration');
 const valid={displayName:'QA',email:'qa@example.test',password:'12345678',username:'qa_user'};
 for(const patch of [{displayName:''},{email:'invalid'},{password:'123'},{username:'a!'},{role:'admin'}])await assert.rejects(store.register({...valid,...patch}));
});
test('empty update response is reported as denied or missing, not success',async()=>{
 const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>({access_token:'test'});store.request=async()=>[];
 await assert.rejects(store.updateContent('missing',{title:'New title'}),/рұқсатыңыз/);await assert.rejects(store.saveSettings({}),/сақталмады/);
});
test('catalog content fetch reads more than the API row limit',async()=>{
 const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>null;let calls=0;
 store.request=async path=>{calls++;return path.includes('offset=0')?Array.from({length:1000},(_,id)=>({id,is_published:true})):[{id:1000,is_published:true}];};
 assert.equal((await store.listContent()).length,1001);assert.equal(calls,2);
});
test('unauthenticated progress saving has readable error',async()=>{
 const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>null;
 await assert.rejects(store.saveProgress('test',{progress:50}),/жүйеге кіріңіз/);
});
function successfulUpload(){globalThis.XMLHttpRequest=class {upload={};status=200;responseText='{}';open(){}setRequestHeader(){}send(){queueMicrotask(()=>this.onload());}};}
test('metadata failure reconciles storage and removes only an unregistered upload',async()=>{
 successfulUpload();const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>({access_token:'test'});let cleaned=false;
 store.request=async(path,options)=>{if(options.method==='POST')throw new Error('metadata rejected');if(options.method==='DELETE'){cleaned=true;return {};}return [];};
 await assert.rejects(store.uploadResource('item',{name:'test.pdf',size:20,type:'application/pdf'}),/metadata rejected/);assert.ok(cleaned);
});
test('lost metadata response preserves a successfully registered upload',async()=>{
 successfulUpload();const store=new SupabaseStore('https://example.test','key');store.validSession=async()=>({access_token:'test'});
 store.request=async(path,options)=>{if(options.method==='POST')throw new Error('network');if(options.method==='DELETE')assert.fail('must preserve registered file');return [{id:'confirmed'}];};
 assert.equal((await store.uploadResource('item',{name:'test.pdf',size:20,type:'application/pdf'})).id,'confirmed');
});

// Exercise the actual browser boot function with overlapping account changes.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('a late admin boot cannot restore hidden data after a guest boot',async()=>{
 const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const bootSource=source.slice(source.indexOf('let bootGeneration=0;'),source.indexOf("window.addEventListener('storage'"));
 assert.ok(bootSource.startsWith('let bootGeneration=0;'));
 const blocked=pending(),started=pending();let actor='admin',authReads=0,renders=0,contentReads=0,resourceReads=0;
 const state={loading:true,settings:{}};
 const store={mode:'supabase',currentUser:async()=>{authReads++;return actor==='admin'?{id:'admin',role:'admin'}:null;},
  listContent:async admin=>{contentReads++;if(admin){started.resolve();await blocked.promise;return [{id:'hidden'}];}return [{id:'public'}];},
  listAllResources:async()=>{resourceReads++;return [{id:actor==='admin'?'private-file':'public-file',item_id:actor==='admin'?'hidden':'public'}];},
  listUsers:async()=>[{id:'private-user'}],getProgress:async()=>[],getSettings:async()=>({interface_version:2})};
 const context={state,store,window:{__CHEM_CONFIG__:{schemaVersion:1}},DEFAULT_THEME:{},normalizeItems:items=>items,
  errorMessage:error=>error.message,showToast(){},applyTheme(){},render(){renders++;},hydrateRoute(){}};
 vm.runInNewContext(bootSource+'\nglobalThis.runBoot=boot;',context);
 const oldBoot=context.runBoot();await started.promise;actor='guest';await context.runBoot();
 blocked.resolve();await oldBoot;
 // Guests receive no lesson bodies or file catalog after the session changes.
 assert.equal(state.user,null);assert.equal(state.items.length,0);
 assert.equal(state.allResources.length,0);assert.equal(state.users.length,0);
 assert.equal(contentReads,1);assert.equal(resourceReads,1);
 assert.equal(state.bootError,null);assert.equal(renders,2);assert.equal(authReads,2);
});

function memberRouteContext(){
 const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const helpers=source.slice(source.indexOf('// Learning pages are shown only'),source.indexOf('const learning=createLearning'));
 const route=source.match(/^function route\(\).*$/m)?.[0];assert.ok(helpers.startsWith('// Learning pages'));assert.ok(route);
 const saved=new Map(),calls={materials:0},state={user:null,loading:false};
 const context={state,calls,BASE_PATH:'/himya-platforma',URL,URLSearchParams,location:{origin:'https://moldir4547.github.io',search:'',hash:''},sessionStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)},pagePath:'/universitet',routePath:()=>context.pagePath,shell:html=>html,PISA_PATH:'/mektep/interaktivti-zhane-innovaciyalyk-tapsyrmalar',lifeMaterialRoute:p=>{calls.materials++;return p.startsWith('/mektep/zhalpy-zhane-beyin')?'LESSON':null;},learning:{route:()=>null},homePage:()=> 'PUBLIC HOME',authPage:mode=>mode,byPath:()=>({id:'university-root'}),modulePage:()=> 'MODULE'};
 vm.runInNewContext(helpers+'\n'+route+'\nthis.memberApi={route,safeMemberNext};',context);return context;
}
test('learning pages require a verified member before lesson renderers run',()=>{
 const context=memberRouteContext();
 for(const route of ['/universitet','/mektep','/materials','/topics','/sabaktastyk-kopiri/himiyalyk-bailanys','/sabaktastyk-kopiri/ekvivalent-ugymy','/mektep/zhalpy-zhane-beyin','/mektep/zhalpy-zhane-beyin/eritindi','/games/redox','/virtual-lab.html']){
  context.pagePath=route;assert.match(context.memberApi.route(),/Материалдарды оқу үшін тіркеліңіз/);assert.equal(context.calls.materials,0);
 }
 context.pagePath='/';assert.equal(context.memberApi.route(),'PUBLIC HOME');context.pagePath='/login';assert.equal(context.memberApi.route(),'login');
 context.pagePath='/mektep/zhalpy-zhane-beyin/eritindi';context.state.user={id:'verified-learner',role:'student'};assert.equal(context.memberApi.route(),'LESSON');context.state.loading=true;assert.match(context.memberApi.route(),/Материалдарды оқу үшін тіркеліңіз/);
});
test('member return links preserve the lesson and reject external or recursive auth URLs',()=>{
 const api=memberRouteContext().memberApi;
 assert.equal(api.safeMemberNext('/himya-platforma/mektep/zhalpy-zhane-beyin/eritindi?level=school#life-review'),'/mektep/zhalpy-zhane-beyin/eritindi?level=school#life-review');
 for(const value of ['https://evil.example/x','//evil.example/x','/\\evil.example/x','/%5Cevil.example/x','/login','/register','/himya-platforma/login'])assert.equal(api.safeMemberNext(value),null);
});
