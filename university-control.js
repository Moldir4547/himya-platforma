import {CONTROL_QUESTIONS,CONTROL_TOPICS,remainingSeconds,reviewControl} from './university-control-data.js';
const BASE='/universitet/agymdyk-bakylau';
const CARD='/universitet/bilim-kartasy';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createUniversityControl({store,state,render,shell}){
 let owner=null,attempt=null,draft=[],historyRows=[],loaded=false,loading=false,error='',status='',busy=false,offset=0,queue=Promise.resolve(),timer=null,finishing=false;
 function reset(){owner=state.user?.id;attempt=null;draft=[];historyRows=[];loaded=false;loading=false;error='';status='';busy=false;finishing=false;offset=0;}
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
   attempt=result.attempt;offset=Date.parse(attempt.server_now)-Date.now();updateProgress(result.progress);
   if(attempt.finished_at){draft=[...attempt.answers];try{localStorage.removeItem(key(id));}catch{}historyRows=[attempt,...historyRows.filter(r=>r.id!==id)];}
   status=attempt.finished_at?'Нәтиже мен жауаптар студенттің білім картасында сақталды.':'Жауаптар серверде сақталды.';
  });
  queue=task;return task.catch(e=>{if(owner!==uid)return;error=e.message.includes('stale_attempt')?'Бұл талпыныс басқа терезеде өзгерді. Бетті жаңартыңыз.':'Сақталмады: '+e.message+' Жергілікті жауаптар сақталды; қайта жіберіңіз.';}).finally(()=>{if(owner===uid){busy=false;if(finish)finishing=false;render();}});
 }
 function finish(){if(finishing||attempt?.finished_at)return;finishing=true;return save(true);}
 async function start(restart=false){if(busy)return;busy=true;error='';const uid=owner;render();try{
  if(state.user.role==='admin')adopt({id:'preview',started_at:new Date().toISOString(),deadline:new Date(Date.now()+1800000).toISOString(),answers:Array(30).fill(-1),questions:CONTROL_QUESTIONS,revision:0});
  else {const a=await store.startCurrentControl(restart);if(owner!==uid||state.user?.id!==uid)return;adopt(a);}
  status='';if(!attempt.finished_at&&remainingSeconds(attempt.deadline,now())===0)await finish();
 }catch(e){if(owner===uid)error='Бақылау басталмады: '+e.message;}finally{if(owner===uid){busy=false;render();}}}
 function navigation(){return '<nav class="school-grades" aria-label="Бақылау бөлімдері"><a href="'+BASE+'">Ағымдық бақылау</a><a href="'+BASE+'/1">1-ағымдық бақылау</a><a href="'+BASE+'/2">2-ағымдық бақылау</a><a href="'+CARD+'">Студенттің білім картасы</a></nav>';}
 function review(a){const questions=a.questions||CONTROL_QUESTIONS;return '<section class="school-panel"><h2>Нәтиже: '+a.score+' / 30</h2><p>'+Math.round(a.score/30*100)+'% · әр дұрыс жауапқа 1 балл.</p><h3>Қатемен жұмыс</h3>'+reviewControl(questions,a.answers).map((q,i)=>'<details class="school-review" '+(!q.correct?'open':'')+'><summary>'+(i+1)+'. '+esc(q.question)+' · '+(q.correct?'Дұрыс':'Қате / жауап жоқ')+'</summary><p>Сіздің жауабыңыз: '+esc(q.options[q.answer]||'Жауап берілмеген')+'</p><p><strong>Дұрыс жауап: '+esc(q.options[q.correct_index])+'</strong></p><p>'+esc(q.explanation)+'</p><p>'+esc(q.reference)+'</p><a href="/universitet/teoriya">Дәрістерді қайталау →</a> · <a href="/universitet/ozin-ozi-daiyndau">Зертхананы қайталау →</a></details>').join('')+'</section>';}
 function intro(){return '<section class="school-panel"><h2>1-ағымдық бақылау</h2><p>30 сұрақ · 30 минут · ең жоғары нәтиже — 30 балл. Әр сұрақта бір дұрыс жауап бар.</p><p>Уақыт «Бақылауды бастау» батырмасын басқанда басталады. Бетті жапсаңыз да уақыт жүреді. Уақыт біткенде серверге уақытында жеткен жауаптар бағаланады, бос жауапқа 0 балл беріледі. Дұрыс жауаптар мен түсіндірмелер аяқтағаннан кейін ашылады.</p><ul>'+CONTROL_TOPICS.map(([,title,n])=>'<li>'+esc(title)+' — '+n+' сұрақ</li>').join('')+'</ul><p>Есептерде Aᵣ(H)=1, C=12, N=14, O=16, Mg=24, Ca=40, Fe=56 деп алыңыз; өзгеше мән сұрақта көрсетіледі.</p><button class="primary-button" data-control-start '+(busy?'disabled':'')+'>'+ (busy?'Жүктелуде…':'Бақылауды бастау')+'</button></section>';}
 function active(){const left=remainingSeconds(attempt.deadline,now()),locked=finishing||left===0;return '<section class="school-panel"><div class="control-clock"><strong>Қалған уақыт: <span data-control-clock role="timer" aria-label="Қалған уақыт">'+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+'</span></strong><span>'+draft.filter(v=>v>=0).length+' / 30 жауап</span></div><p>Бір дұрыс жауапты таңдаңыз. Жауаптар автоматты сақталады.</p><form data-control-form>'+attempt.questions.map((q,i)=>'<fieldset class="school-question" '+(locked?'disabled':'')+'><legend>'+(i+1)+'. '+esc(q.question)+'</legend>'+q.options.map((o,j)=>'<label class="school-option"><input type="radio" name="control-'+i+'" data-control-answer="'+i+'" value="'+j+'" '+(draft[i]===j?'checked':'')+'>'+esc(o)+'</label>').join('')+'</fieldset>').join('')+'<p>Жауап берілмеген: '+draft.filter(v=>v<0).length+'. Аяқтаған соң жауап өзгертілмейді.</p><button type="submit" class="primary-button" '+(finishing?'disabled':'')+'>'+(finishing?'Аяқталуда…':'Бақылауды аяқтау және нәтижені сақтау')+'</button> <button type="button" data-control-save>Сақтауды қайталау</button></form></section>';}
 function card(){load();const admin=state.user?.role==='admin',rows=admin?(state.analytics?.details||[]):state.progress;const university=rows.filter(r=>state.items.some(i=>i.id===r.item_id&&i.area==='university'));
 return '<h1>Студенттің білім картасы</h1><p>Соңғы ұпай, жауаптар және алдыңғы талпыныстар сақталады.</p><div class="school-result-list">'+university.map(r=>'<article><h2>'+esc(state.items.find(i=>i.id===r.item_id)?.title)+'</h2><p>'+ (r.max_score!=null?r.score+' / '+r.max_score:esc(r.progress||0)+'%')+' · Талпыныс: '+esc(r.attempt_count||0)+'</p></article>').join('')+'</div><h2>Ағымдық бақылау талпыныстары</h2>'+(!loaded?'<p>Жүктелуде…</p>':historyRows.length?historyRows.map(a=>'<details class="school-review"><summary>1-ағымдық бақылау · '+(a.finished_at?a.score+' / 30':'Аяқталмаған')+' · '+esc(new Date(a.started_at).toLocaleString('kk-KZ'))+(admin?' · '+esc(state.analytics?.users?.find(u=>u.id===a.user_id)?.display_name||'Білім алушы'):'')+'</summary>'+(a.finished_at?review(a):'<a href="'+BASE+'/1">Бақылауды жалғастыру →</a>')+'</details>').join(''):'<p>Әлі талпыныс жоқ.</p>');}
 function route(path){syncOwner();if(![BASE,BASE+'/1',BASE+'/2',CARD].includes(path))return null;
 if(!state.user)return shell('<section class="school-path"><h1>Ағымдық бақылау</h1><p>Бақылауды орындап, нәтижені сақтау үшін кіріңіз.</p><a href="/login">Жүйеге кіру →</a></section>');
 let content='';if(path===CARD)content=card();else if(path===BASE)content='<h1>Ағымдық бақылау</h1><div class="school-cards"><a class="school-card" href="'+BASE+'/1"><h2>1-ағымдық бақылау</h2><p>Дәрістер мен зертханалар · 30 сұрақ · 30 минут</p><b>Бақылауды ашу →</b></a><a class="school-card" href="'+BASE+'/2"><h2>2-ағымдық бақылау</h2><p>Дайындалуда</p></a></div>';
 else if(path===BASE+'/2')content='<section class="school-panel"><h1>2-ағымдық бақылау</h1><p>Дайындалуда. Тақырыптары мен тапсырмалары кейін қосылады.</p></section>';
 else {if(state.user.role!=='admin')load();content='<h1>1-ағымдық бақылау</h1>'+(state.user.role==='admin'?'<p>Әкімші режимі: алдын ала көру, жеке нәтиже сақталмайды.</p>':'')+(!loaded&&state.user.role!=='admin'?'<p>Талпыныс жүктелуде…</p>':!attempt?intro():attempt.finished_at?review(attempt)+'<p><button data-control-restart>Қайта орындау · жаңа 30 минут</button></p>':active());}
 return shell('<div class="school-path" data-university-control><a href="/universitet">← Университет модулі</a>'+navigation()+content+'<p role="status" data-control-status>'+esc(status)+'</p><p role="alert">'+esc(error)+'</p>'+(error&&!loaded?'<button data-control-load>Қайта жүктеу</button>':'')+'<p class="school-source">Дерек: университеттің №1–6 дәрістері; эквивалент пен газдың молярлық массасын анықтау зертханалары; Ж.Ә. Шоқыбаев, Д.Ә. Қаражанова, М.А. Оразбаева, «Бейорганикалық химияның теориялық негіздері және элементтер химиясы практикумы», 2013. Сұрақтар платформа үшін қайта құрастырылды.</p></div>');}
 function bind(root){clearInterval(timer);timer=null;const host=root.querySelector('[data-university-control]');if(!host)return;syncOwner();
 host.querySelector('[data-control-start]')?.addEventListener('click',()=>start(false));host.querySelector('[data-control-restart]')?.addEventListener('click',()=>start(true));
 host.querySelector('[data-control-load]')?.addEventListener('click',()=>{error='';load();render();});
 host.querySelector('[data-control-form]')?.addEventListener('submit',e=>{e.preventDefault();finish();});
 host.querySelector('[data-control-save]')?.addEventListener('click',()=>remainingSeconds(attempt.deadline,now())===0?finish():save(false));
 host.querySelectorAll('[data-control-answer]').forEach(input=>input.addEventListener('change',()=>{
  if(finishing||attempt.finished_at||remainingSeconds(attempt.deadline,now())===0){finish();return;}
  draft[Number(input.dataset.controlAnswer)]=Number(input.value);error='';remember();save(false);
 }));
 if(attempt&&!attempt.finished_at&&host.querySelector('[data-control-clock]')){const tick=()=>{const left=remainingSeconds(attempt.deadline,now()),clock=host.querySelector('[data-control-clock]');if(clock)clock.textContent=Math.floor(left/60)+':'+String(left%60).padStart(2,'0');if(left===0&&!finishing)finish();};timer=setInterval(tick,1000);tick();}
 }
 return {route,bind};
}
