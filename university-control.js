import {CONTROL_QUESTIONS,CONTROL_TOPICS,remainingSeconds,reviewControl} from './university-control-data.js';
const BASE='/universitet/agymdyk-bakylau';
const CARD='/universitet/bilim-kartasy';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function knowledgeCardData(state, history=[], userId=state.user?.id){
 const items=new Map((state.items||[]).filter(i=>i.area==='university').map(i=>[i.id,i]));
 const stamp=r=>Date.parse(r.tested_at||r.updated_at||r.last_opened||r.started_at||'')||0;
 const group=item=>{let node=item,seen=new Set();while(node&&!seen.has(node.id)){seen.add(node.id);if(node.path==='/universitet/teoriya')return 'lectures';if(node.path==='/universitet/ozin-ozi-daiyndau')return 'labs';if(node.path?.startsWith(BASE))return 'controls';node=items.get(node.parent_id);}return 'materials';};
 const rows=(state.user?.role==='admin'?state.analytics?.details:state.progress)||[];
 const unique=new Map();
 for(const r of rows){const item=items.get(r.item_id);if(!item||item.path==='/universitet'||item.item_type==='report'||item.path===CARD)continue;
  if(r.user_id ? r.user_id!==userId : state.user?.role==='admin')continue;
  const previous=unique.get(r.item_id);if(!previous||stamp(r)>stamp(previous))unique.set(r.item_id,r);
 }
 const groups={lectures:[],labs:[],controls:[],materials:[]};
 for(const r of unique.values()){const item=items.get(r.item_id);groups[group(item)].push({...r,item});}
 const order=(a,b)=>(a.item.sort_order??0)-(b.item.sort_order??0)||String(a.item.title).localeCompare(String(b.item.title),'kk',{numeric:true});
 for(const rows of Object.values(groups))rows.sort(order);
 const attempts=history.filter(a=>a.user_id===userId).slice().sort((a,b)=>stamp(b)-stamp(a)||String(a.id).localeCompare(String(b.id)));
 const finished=attempts.filter(a=>a.finished_at);
 return {groups,attempts,finished,latest:finished[0]||null,best:finished.length?Math.max(...finished.map(a=>a.score)):null};
}

export function createUniversityControl({store,state,render,shell}){
 let owner=null,attempt=null,draft=[],historyRows=[],loaded=false,loading=false,error='',status='',busy=false,offset=0,queue=Promise.resolve(),timer=null,finishing=false,expiredSent=false,cardUser='';
 function reset(){owner=state.user?.id;attempt=null;draft=[];historyRows=[];loaded=false;loading=false;error='';status='';busy=false;finishing=false;expiredSent=false;offset=0;cardUser='';}
 function syncOwner(){if(owner!==state.user?.id)reset();}
 const now=()=>Date.now()+offset;
 const key=id=>'chem-university-control:'+owner+':'+id;
 function remember(){if(!attempt||attempt.finished_at||state.user?.role==='admin')return;try{localStorage.setItem(key(attempt.id),JSON.stringify(draft));}catch{}}
 function adopt(a){attempt=a;if(a?.server_now)offset=Date.parse(a.server_now)-Date.now();draft=[...(a?.answers||Array(30).fill(-1))];
  if(a&&!a.finished_at&&remainingSeconds(a.deadline,now())>0){try{const cached=JSON.parse(localStorage.getItem(key(a.id)));if(Array.isArray(cached)&&cached.length===30&&cached.every((v,i)=>Number.isInteger(v)&&v>=-1&&v<4))draft=cached;}catch{}}
 }
 function load(){if(loaded||loading||!state.user)return;loading=true;const uid=owner;
  store.listCurrentControlAttempts().then(async rows=>{if(state.user?.role==='admin'){const analytics=await store.getAnalytics();if(owner===uid)state.analytics=analytics;}else if(rows?.[0]&&!rows[0].finished_at){rows=[await store.startCurrentControl(false),...rows.slice(1)];}return rows;}).then(rows=>{if(owner!==uid||state.user?.id!==uid)return;historyRows=rows||[];if(state.user.role!=='admin')adopt(historyRows[0]||null);loaded=true;error='';}).catch(e=>{if(owner===uid)error='Нәтижелер жүктелмеді: '+e.message;}).finally(()=>{if(owner===uid){loading=false;render();}});
 }
 function updateProgress(row){if(!row)return;const i=state.progress.findIndex(r=>r.item_id===row.item_id);if(i<0)state.progress.push(row);else state.progress[i]=row;}
 function save(finish=false){const uid=owner,id=attempt?.id;if(!id)return Promise.resolve();remember();busy=true;status='Жауаптар сақталуда…';
  const task=queue.catch(()=>{}).then(async()=>{
   if(owner!==uid||state.user?.id!==uid||attempt?.id!==id)return;
   if(attempt.finished_at)return;
   if(state.user.role==='admin'){if(finish){attempt={...attempt,answers:[...draft],finished_at:new Date().toISOString(),score:reviewControl(CONTROL_QUESTIONS,draft).filter(q=>q.correct).length};status='Әкімшінің алдын ала көруі: нәтиже сақталмайды.';}return;}
   const result=await store.saveCurrentControl(id,[...draft],attempt.revision,finish);
   if(owner!==uid||state.user?.id!==uid||attempt?.id!==id)return;
   error='';attempt=result.attempt;offset=Date.parse(attempt.server_now)-Date.now();updateProgress(result.progress);
   if(attempt.finished_at){draft=[...attempt.answers];try{localStorage.removeItem(key(id));}catch{}historyRows=[attempt,...historyRows.filter(r=>r.id!==id)];}
   status=attempt.finished_at?'Нәтиже мен жауаптар студенттің білім картасында сақталды.':'Жауаптар серверде сақталды.';
  });
  queue=task;return task.catch(e=>{if(owner!==uid)return;error=e.message.includes('stale_attempt')?'Бұл талпыныс басқа терезеде өзгерді. Бетті жаңартыңыз.':'Сақталмады: '+e.message+' Жергілікті жауаптар сақталды; қайта жіберіңіз.';}).finally(()=>{if(owner===uid){busy=false;if(finish)finishing=false;render();}});
 }
 function finish(){if(finishing||attempt?.finished_at)return;finishing=true;return save(true);}
 async function start(restart=false){if(busy)return;busy=true;expiredSent=false;error='';const uid=owner;render();try{
  if(state.user.role==='admin')adopt({id:'preview',started_at:new Date().toISOString(),deadline:new Date(Date.now()+1800000).toISOString(),answers:Array(30).fill(-1),questions:CONTROL_QUESTIONS,revision:0});
  else {const a=await store.startCurrentControl(restart);if(owner!==uid||state.user?.id!==uid)return;adopt(a);}
  status='';if(!attempt.finished_at&&remainingSeconds(attempt.deadline,now())===0)await finish();
 }catch(e){if(owner===uid)error='Бақылау басталмады: '+e.message;}finally{if(owner===uid){busy=false;render();}}}
 function navigation(){return '<nav class="school-grades" aria-label="Бақылау бөлімдері"><a href="'+BASE+'">Ағымдық бақылау</a><a href="'+BASE+'/1">1-ағымдық бақылау</a><a href="'+BASE+'/2">2-ағымдық бақылау</a><a href="'+CARD+'">Студенттің білім картасы</a></nav>';}
 function review(a,collapsed=false){const questions=a.questions||CONTROL_QUESTIONS;return '<section class="school-panel"><h2>Нәтиже: '+a.score+' / 30</h2><p>'+Math.round(a.score/30*100)+'% · әр дұрыс жауапқа 1 балл.</p><h3>Қатемен жұмыс</h3>'+reviewControl(questions,a.answers).map((q,i)=>'<details class="school-review" '+(!collapsed&&!q.correct?'open':'')+'><summary>'+(i+1)+'. '+esc(q.question)+' · '+(q.correct?'Дұрыс':'Қате / жауап жоқ')+'</summary><p>Сіздің жауабыңыз: '+esc(q.options[q.answer]||'Жауап берілмеген')+'</p><p><strong>Дұрыс жауап: '+esc(q.options[q.correct_index])+'</strong></p><p>'+esc(q.explanation)+'</p><p>'+esc(q.reference)+'</p><a href="/universitet/teoriya">Дәрістерді қайталау →</a> · <a href="/universitet/ozin-ozi-daiyndau">Зертхананы қайталау →</a></details>').join('')+'</section>';}
 function intro(){return '<section class="school-panel"><h2>1-ағымдық бақылау</h2><p>30 сұрақ · 30 минут · ең жоғары нәтиже — 30 балл. Әр сұрақта бір дұрыс жауап бар.</p><p>Уақыт «Бақылауды бастау» батырмасын басқанда басталады. Бетті жапсаңыз да уақыт жүреді. Уақыт біткенде серверге уақытында жеткен жауаптар бағаланады, бос жауапқа 0 балл беріледі. Дұрыс жауаптар мен түсіндірмелер аяқтағаннан кейін ашылады.</p><ul>'+CONTROL_TOPICS.map(([,title,n])=>'<li>'+esc(title)+' — '+n+' сұрақ</li>').join('')+'</ul><p>Есептерде Aᵣ(H)=1, C=12, N=14, O=16, Mg=24, Ca=40, Fe=56 деп алыңыз; өзгеше мән сұрақта көрсетіледі.</p><button class="primary-button" data-control-start '+(busy?'disabled':'')+'>'+ (busy?'Жүктелуде…':'Бақылауды бастау')+'</button></section>';}
 function active(){const left=remainingSeconds(attempt.deadline,now()),locked=finishing||left===0;return '<section class="school-panel"><div class="control-clock"><strong>Қалған уақыт: <span data-control-clock role="timer" aria-label="Қалған уақыт">'+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+'</span></strong><span>'+draft.filter(v=>v>=0).length+' / 30 жауап</span></div><p>Бір дұрыс жауапты таңдаңыз. Жауаптар автоматты сақталады.</p><form data-control-form>'+attempt.questions.map((q,i)=>'<fieldset class="school-question" '+(locked?'disabled':'')+'><legend>'+(i+1)+'. '+esc(q.question)+'</legend>'+q.options.map((o,j)=>'<label class="school-option"><input type="radio" name="control-'+i+'" data-control-answer="'+i+'" value="'+j+'" '+(draft[i]===j?'checked':'')+'>'+esc(o)+'</label>').join('')+'</fieldset>').join('')+'<p>Жауап берілмеген: '+draft.filter(v=>v<0).length+'. Аяқтаған соң жауап өзгертілмейді.</p><button type="submit" class="primary-button" '+(finishing?'disabled':'')+'>'+(finishing?'Аяқталуда…':'Бақылауды аяқтау және нәтижені сақтау')+'</button> <button type="button" data-control-save>Сақтауды қайталау</button></form></section>';}

 function readingGroup(title,rows){
  if(!rows.length)return '<section class="knowledge-section"><h2>'+title+'</h2><p class="knowledge-empty">Әзірге оқу әрекеті тіркелмеген.</p></section>';
  return '<section class="knowledge-section"><h2>'+title+'</h2><ol class="knowledge-list">'+rows.map(r=>{
   const assessed=Number(r.max_score)>0;
   const label=assessed?r.score+' / '+r.max_score+' балл':r.completed?'Орындалды':Number(r.progress)>0?'Оқу прогресі: '+r.progress+'%':'Материал ашылған';
   const date=r.tested_at||r.last_opened||r.updated_at;
   return '<li><div><a href="'+esc(r.item.path)+'">'+esc(r.item.title)+'</a><p>'+esc(label)+(assessed?' · Талпыныс: '+esc(r.attempt_count||1):'')+'</p>'+(date?'<small>'+esc(new Date(date).toLocaleString('kk-KZ'))+'</small>':'')+'</div><a class="secondary-button" href="'+esc(r.item.path)+'">Ашу →</a></li>';
  }).join('')+'</ol></section>';
 }
 function card(){load();const admin=state.user?.role==='admin';
  const names=new Map((state.analytics?.users||[]).map(u=>[u.id,u.display_name||u.email||'Білім алушы']));
  if(admin){for(const r of state.analytics?.details||[])if(r.user_id&&!names.has(r.user_id))names.set(r.user_id,r.display_name||'Білім алушы');for(const a of historyRows)if(!names.has(a.user_id))names.set(a.user_id,'Білім алушы');}
  const students=[...names].sort((a,b)=>String(a[1]).localeCompare(String(b[1]),'kk'));
  const filter=admin?'<label class="knowledge-filter">Білім алушы<select data-card-user><option value="">Барлық білім алушы · қысқаша шолу</option>'+students.map(([id,name])=>'<option value="'+esc(id)+'" '+(cardUser===id?'selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>':'';
  let html='<header class="knowledge-header"><h1>Студенттің білім картасы</h1><p>Оқу әрекеттері, бақылау нәтижелері және қателермен жұмыс.</p></header>'+filter;
  if(!loaded)return html+'<p>Нәтижелер жүктелуде…</p>';
  if(admin&&!cardUser)return html+'<h2>Білім алушылар</h2><p>Нақты нәтижелерді көру үшін студентті таңдаңыз.</p><div class="knowledge-students">'+students.map(([id,name])=>{
   const d=knowledgeCardData(state,historyRows,id);
   return '<article><h3>'+esc(name)+'</h3><p>Аяқталған талпыныс: '+d.finished.length+'</p><p>Соңғы нәтиже: '+(d.latest?d.latest.score+' / 30':'Әлі тапсырмаған')+'</p><button data-card-open="'+esc(id)+'">Картаны ашу →</button></article>';
  }).join('')+'</div>';
  const userId=admin?cardUser:state.user.id,d=knowledgeCardData(state,historyRows,userId);
  if(admin)html+='<h2 class="knowledge-student-name">'+esc(names.get(userId)||'Білім алушы')+'</h2>';
  html+='<div class="knowledge-summary"><article><span>Аяқталған талпыныс</span><strong>'+d.finished.length+'</strong></article><article><span>Соңғы нәтиже</span><strong>'+(d.latest?d.latest.score+' / 30':'—')+'</strong></article><article><span>Ең жақсы нәтиже</span><strong>'+(d.best!==null?d.best+' / 30':'—')+'</strong></article></div>';
  html+='<nav class="school-grades" aria-label="Білім картасының бөлімдері"><a href="#card-controls">Бақылаулар</a><a href="#card-lectures">Дәрістер</a><a href="#card-labs">Зертханалар</a><a href="#card-history">Талпыныстар тарихы</a></nav>';
  html+='<section class="knowledge-section" id="card-controls"><h2>1. Ағымдық бақылаулар</h2><div class="knowledge-controls"><article><h3>1-ағымдық бақылау</h3><p>'+(d.latest?'Соңғы нәтиже: <strong>'+d.latest.score+' / 30</strong>':d.attempts.some(a=>!a.finished_at)?'Басталған · аяқталмаған':'Әлі тапсырылмаған')+'</p><p>30 сұрақ · 30 минут</p><a href="'+BASE+'/1">'+(admin?'Бақылауды қарау':d.attempts.some(a=>!a.finished_at)?'Жалғастыру →':'Бақылауды ашу →')+'</a></article><article><h3>2-ағымдық бақылау</h3><p>Дайындалуда</p></article></div></section>';
  html+='<div id="card-lectures">'+readingGroup('2. Дәрістер',d.groups.lectures)+'</div><div id="card-labs">'+readingGroup('3. Зертханалық сабақтар',d.groups.labs)+'</div>';
  if(d.groups.materials.length)html+='<details class="knowledge-section"><summary>Қосымша материалдар және силлабус</summary>'+readingGroup('Қосымша материалдар',d.groups.materials)+'</details>';
  html+='<section class="knowledge-section" id="card-history"><h2>4. Талпыныстар тарихы</h2><p>Жаңадан ескіге қарай. Жауаптар мен түсіндірмелерді ашып қараңыз.</p>'+(d.attempts.length?d.attempts.map((a,i)=>'<details class="school-review knowledge-attempt"><summary>Талпыныс '+(d.attempts.length-i)+' · '+(a.finished_at?a.score+' / 30':'Аяқталмаған')+' · '+esc(new Date(a.started_at).toLocaleString('kk-KZ'))+'</summary>'+(a.finished_at?review(a,true):'<p>Бұл талпыныс әлі аяқталмаған.</p>'+(admin?'':'<a href="'+BASE+'/1">Бақылауды жалғастыру →</a>'))+'</details>').join(''):'<p class="knowledge-empty">Әлі талпыныс жоқ.</p>')+'</section>';
  return html;
 }
 function route(path){syncOwner();if(![BASE,BASE+'/1',BASE+'/2',CARD].includes(path))return null;
 if(!state.user)return shell('<section class="school-path"><h1>Ағымдық бақылау</h1><p>Бақылауды орындап, нәтижені сақтау үшін кіріңіз.</p><a href="/login">Жүйеге кіру →</a></section>');
 let content='';if(path===CARD)content=card();else if(path===BASE)content='<h1>Ағымдық бақылау</h1><div class="school-cards"><a class="school-card" href="'+BASE+'/1"><h2>1-ағымдық бақылау</h2><p>Дәрістер мен зертханалар · 30 сұрақ · 30 минут</p><b>Бақылауды ашу →</b></a><a class="school-card" href="'+BASE+'/2"><h2>2-ағымдық бақылау</h2><p>Дайындалуда</p></a></div>';
 else if(path===BASE+'/2')content='<section class="school-panel"><h1>2-ағымдық бақылау</h1><p>Дайындалуда. Тақырыптары мен тапсырмалары кейін қосылады.</p></section>';
 else {if(state.user.role!=='admin')load();content='<h1>1-ағымдық бақылау</h1>'+(state.user.role==='admin'?'<p>Әкімші режимі: алдын ала көру, жеке нәтиже сақталмайды.</p>':'')+(!loaded&&state.user.role!=='admin'?'<p>Талпыныс жүктелуде…</p>':!attempt?intro():attempt.finished_at?review(attempt)+'<p><button data-control-restart>Қайта орындау · жаңа 30 минут</button></p>':active());}
 return shell('<div class="school-path" data-university-control><a href="/universitet">← Университет модулі</a>'+navigation()+content+'<p role="status" data-control-status>'+esc(path===CARD?'':status)+'</p><p role="alert">'+esc(error)+'</p>'+(error&&!loaded?'<button data-control-load>Қайта жүктеу</button>':'')+(path===CARD?'':'<p class="school-source">Дерек: университеттің №1–6 дәрістері; эквивалент пен газдың молярлық массасын анықтау зертханалары; Ж.Ә. Шоқыбаев, Д.Ә. Қаражанова, М.А. Оразбаева, «Бейорганикалық химияның теориялық негіздері және элементтер химиясы практикумы», 2013. Сұрақтар платформа үшін қайта құрастырылды.</p>')+'</div>');}
 function bind(root){clearInterval(timer);timer=null;const host=root.querySelector('[data-university-control]');if(!host)return;syncOwner();
 host.querySelector('[data-card-user]')?.addEventListener('change',e=>{cardUser=e.target.value;render();});
 host.querySelectorAll('[data-card-open]').forEach(b=>b.addEventListener('click',()=>{cardUser=b.dataset.cardOpen;render();}));
 host.querySelector('[data-control-start]')?.addEventListener('click',()=>start(false));host.querySelector('[data-control-restart]')?.addEventListener('click',()=>start(true));
 host.querySelector('[data-control-load]')?.addEventListener('click',()=>{error='';load();render();});
 host.querySelector('[data-control-form]')?.addEventListener('submit',e=>{e.preventDefault();finish();});
 host.querySelector('[data-control-save]')?.addEventListener('click',()=>remainingSeconds(attempt.deadline,now())===0?finish():save(false));
 host.querySelectorAll('[data-control-answer]').forEach(input=>input.addEventListener('change',()=>{
  if(finishing||attempt.finished_at||remainingSeconds(attempt.deadline,now())===0){finish();return;}
  draft[Number(input.dataset.controlAnswer)]=Number(input.value);error='';remember();save(false);
 }));
 if(attempt&&!attempt.finished_at&&host.querySelector('[data-control-clock]')){const tick=()=>{const left=remainingSeconds(attempt.deadline,now()),clock=host.querySelector('[data-control-clock]');if(clock)clock.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(left===0&&!finishing&&!expiredSent){expiredSent=true;finish();}};timer=setInterval(tick,1000);tick();}
 }
 return {route,bind};
}
