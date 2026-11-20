// One ungraded exit reflection per learner and lesson.
const bridgeLessons={
 bond:{title:'Химиялық байланыс',panel:'bridge',school:'Қатты ас тұзы ток өткізбейді, ал оның судағы ерітіндісі өткізеді. Екі жағдайда иондардың қозғалысы қалай өзгереді?',uni:'Оқушы «Тұз суда ерігенде одан электрондар босап шығады» деді. Кристалл мен ерітіндіні салыстырып, осы ойды оқушыға қалай түзетіп түсіндірер едіңіз?',topics:[['Иондар және электрөткізгіштік','bond-ionic'],['Молекула пішіні және полярлық','bond-shape'],['Молекулалық орбитальдар','bond-mo']]},
 equivalent:{title:'Эквивалент ұғымы',panel:'eq',school:'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O. Бір моль қышқылды толық бейтараптандыруға неше моль NaOH керек? Жауабыңды теңдеумен түсіндір.',uni:'Студент «H₂SO₄ үшін z әрқашан 2» деді. NaHSO₄ және Na₂SO₄ түзілетін екі жағдайды салыстырып, эквиваленттің реакцияға неліктен тәуелді екенін түсіндіріңіз.',topics:[['Коэффициент пен мольдік қатынас','eqv-moles'],['Реакцияға тәуелді эквивалент факторы','eqv-factor'],['Титрлеудегі эквиваленттік нүкте','eqv-titration']]}
};
export const lessons={...bridgeLessons};
const cards=[
 ['indicator','Индикатор','Бұрын мен … деп ойладым. Бүгін ойым өзгерді, себебі …','Бұрын қолданған түсіндірмем қалай өзгерді? Оған қандай дерек әсер етті?'],
 ['catalyst','Катализатор','Қай мысал немесе әрекет саған «енді түсіндім!» дегізді?','Қай модель, тәжірибе немесе талқылау түсінігіңізді тереңдетті? Неліктен?'],
 ['bond','Байланыс','Бүгінгі ұғым саған үйдегі немесе көшедегі қандай құбылысты еске салды?','Осы ұғымды практикада мектеп оқушысына қандай таныс мысалмен түсіндірер едіңіз?'],
 ['unknown','Белгісіз зат','Қай тұсы әлі жұмбақ? Мұғалімге бір сұрақ қалдыр.','Мектептегі түсініктен университет деңгейіне өткенде қандай сұрақ ашық қалды?']
];
const prefix=c=>c?'['+c[1]+'] ':'';
const chosen=text=>cards.find(c=>String(text||'').startsWith(prefix(c)));
const steps=['Мысалды көргенде танимын','Себебін өзім түсіндіремін','Жаңа жағдайға қолданамын','Мұны мектеп оқушысына түсіндіре аламын'];
const helps={diagram:'Сызба',example:'Өмірлік мысал',lab:'Симулятор',practice:'Тапсырма',none:'Әзірге ешқайсысы'};
const marks={supported:'Дәлелді',partial:'Ішінара негізделген',revisit:'Қайта қарау қажет'};
const audience={school_student:'Оқушы',university_student:'Студент'};
const h=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const options=o=>Object.entries(o).map(([k,v])=>'<option value="'+h(k)+'">'+h(v)+'</option>').join('');
const keys=['first','second','third'];
const topics=l=>Object.fromEntries([['clear','Қазір сұрағым жоқ'],...lessons[l].topics.map(([t],i)=>[keys[i],t]),['other','Басқа сұрақ']]);
const isStaff=u=>u?.role==='admin'||u?.participant_type==='teacher';
const isUni=u=>u?.participant_type==='university_student'||(!u?.participant_type&&u?.role==='university_student');
const err=e=>/unknown_teacher_code/i.test(e?.message)?'Мұғалім коды табылмады. Кодты тексеріңіз немесе өрісті бос қалдырыңыз.':/reflection_conflict/i.test(e?.message)?'Жауап басқа бетте өзгертілді. Мәтініңізді көшіріп алып, бетті жаңартыңыз.':/teacher_required|permission denied/i.test(e?.message)?'Бұл есепті көру үшін әкімші мұғалімге қабылдау құқығын беруі керек.':'Дерекқормен байланыс орнамады. Қайта көріңіз.';
const api=(store,state,owner)=>async(path,args)=>{if(!store?.validSession)throw Error('offline');const sess=await store.validSession();if(!owner||state.user?.id!==owner||sess?.user?.id!==owner)throw Error('session_changed');return store.request('/rest/v1/'+path,{headers:store.headers(sess.access_token),...(args===undefined?{}:{method:'POST',body:JSON.stringify(args)})});};
function support(l,k){const row=lessons[l].topics[keys.indexOf(k)];return row?'<a href="#'+row[1]+'">Қайталау: '+h(row[0])+' →</a>':'';}
export function reflectionForm(l,uni){
 const d=lessons[l];return '<form data-exit-form><fieldset><legend>1 · Қай баспалдақтамын?</legend><div class="ex-steps">'+steps.slice(0,uni?4:3).map((t,i)=>'<label><input required type="radio" name="step" value="'+(i+1)+'"> <span>'+h(t)+'</span></label>').join('')+'</div></fieldset><fieldset><legend>2 · Колбаға қандай ой саласың?</legend><div class="ex-cards" role="group" aria-label="Ой карталары">'+cards.map(c=>'<button type="button" data-thought="'+c[0]+'" aria-pressed="false">'+c[1]+'</button>').join('')+'</div><label><span data-prompt aria-live="polite">'+h(uni?d.uni:d.school)+'</span><textarea name="evidence" rows="2" required maxlength="600" placeholder="Бір-екі сөйлем жеткілікті"></textarea></label></fieldset><fieldset><legend>3 · Мұғалімге белгі қалдыр</legend><div class="ex-pair"><label>Не көмектесті?<select name="helpful" required><option value="">Таңдаңыз</option>'+options(helps)+'</select></label><label>Қай ұғымды қайталайсыз?<select name="difficulty" required><option value="">Таңдаңыз</option>'+options(topics(l))+'</select></label></div><p data-exit-link></p><label>'+h(uni?'Мектептен білетінім… Университетте қосылғаны… (міндетті емес)':'Мұғалімге сұрағым немесе ұсынысым (міндетті емес)')+'<textarea name="note" rows="2" maxlength="400"></textarea></label></fieldset><details><summary>Жазған жауабымды өз мұғаліміме көрсету</summary><p>Мұғалім берген жұмыс парағы кодын енгізіңіз. Сонда ол сіз бөліскен жауапты оқи алады. Кодсыз жауап өз нәтижеңізде сақталады және жалпы санаққа кіреді.</p><label>Мұғалім коды <input name="code" autocomplete="off" spellcheck="false"></label><label data-keep-label hidden><input name="keep" type="checkbox" checked> Осы мұғалімге көрсетуді жалғастыру</label></details><button type="submit" class="primary-button">Кері байланысты сақтау</button></form>';
}
function summary(r,l){return '<h3>Менің сақталған жауабым</h3><p><b>Баспалдақ:</b> '+h(steps[r.step-1])+'</p><p><b>Жауабым:</b> '+h(r.evidence)+'</p><p><b>Көмектесті:</b> '+h(helps[r.helpful])+' · <b>Қайталау:</b> '+h(topics(l)[r.difficulty])+'</p>'+(r.note?'<p><b>Пікірім:</b> '+h(r.note)+'</p>':'')+support(l,r.difficulty)+'<p>'+h(r.review?'Мұғалімнің белгісі: '+marks[r.review]:r.teacher?'Мұғалімге көрсетілді.':'Жазбаша жауабыңыз өзіңізге ғана көрінеді.')+'</p>';}
function learner(root,l,store,state,mount){
 const {panel}=lessons[l],result=mount||root.querySelector('#'+panel+'-panel-4'),test=panel&&root.querySelector('#'+panel+'-panel-3');if(!result||result.querySelector('[data-exit]'))return;
 const user=state.user,owner=user?.id,read=api(store,state,owner),box=document.createElement('section');box.className='ex-card';box.dataset.exit=l;
 box.innerHTML='<small>САБАҚ СОҢЫ · 1 МИНУТ</small><h2 tabindex="-1">Ой колбасы · сабақ рефлексиясы</h2><p>'+h(lessons[l].title)+' сабағынан қандай ой алып шықтың? Карта таңда немесе өз сөзіңмен жаз. Мұнда дұрыс не қате жауап жоқ; сабақ ұпайы өзгермейді.</p><div data-exit-summary></div>'+(user?reflectionForm(l,isUni(user)):'<p>Жауабыңды сақтау үшін жеке аккаунтыңа кір.</p>')+'<p role="status" aria-live="polite" data-exit-status></p><button type="button" data-exit-reload hidden>Сақталған жауапты қайта жүктеу</button>';result.append(box);
 const tab=panel&&root.querySelector('#'+panel+'-tab-4');if(test&&tab){const btn=document.createElement('button');btn.className='secondary-button';btn.type='button';btn.textContent='Сабақты қорытындылау · 1 минут →';test.append(btn);btn.onclick=()=>{tab.click();box.querySelector('h2').focus();};}
 if(location.hash==='#feedback'&&tab)queueMicrotask(()=>{if(box.isConnected){tab.click();box.querySelector('h2').focus();}});
 const form=box.querySelector('form');if(!form)return;const status=box.querySelector('[data-exit-status]'),sum=box.querySelector('[data-exit-summary]'),again=box.querySelector('[data-exit-reload]'),e=form.elements;
 let card;const prompt=form.querySelector('[data-prompt]'),uni=isUni(user),baseline=prompt.textContent;
 function choose(c){card=c;for(const b of form.querySelectorAll('[data-thought]'))b.setAttribute('aria-pressed',String(b.dataset.thought===c?.[0]));prompt.textContent=c?c[uni?3:2]:baseline;e.evidence.maxLength=600-prefix(c).length;}
 for(const b of form.querySelectorAll('[data-thought]'))b.onclick=()=>choose(b.getAttribute('aria-pressed')==='true'?undefined:cards.find(c=>c[0]===b.dataset.thought));
 box.addEventListener('click',ev=>{const a=ev.target.closest('a[href^="#school-concept-"]');if(!a)return;ev.preventDefault();const id=a.hash.slice(1);root.querySelector('#school-tab-understand')?.click();document.getElementById(id)?.scrollIntoView({block:'center'});});
 e.difficulty.onchange=()=>{box.querySelector('[data-exit-link]').innerHTML=support(l,e.difficulty.value);};
 if(isStaff(user)){form.onsubmit=ev=>ev.preventDefault();form.querySelector('[type=submit]').disabled=true;status.textContent='Мұғалімнің алдын ала қарауы. Бұл үлгі топ санағына кірмейді.';return;}
 let revision=0,loaded=false,pending=false;
 function fill(r){if(!r)return;revision=r.revision;e.step.value=r.step;choose(chosen(r.evidence));e.evidence.value=r.evidence.slice(prefix(card).length);e.helpful.value=r.helpful;e.difficulty.value=r.difficulty;e.note.value=r.note||'';e.code.value='';e.keep.checked=!!r.teacher;form.querySelector('[data-keep-label]').hidden=!r.teacher;e.difficulty.onchange();sum.innerHTML=summary(r,l);}
 async function get(){if(loaded||pending||!box.isConnected)return;pending=true;form.inert=true;again.hidden=true;status.textContent='Сақталған жауап тексерілуде…';try{const [r]=await read('bridge_exits?learner=eq.'+encodeURIComponent(owner)+'&lesson=eq.'+encodeURIComponent(l)+'&select=step,evidence,helpful,difficulty,note,review,revision,teacher');if(state.user?.id!==owner||!box.isConnected)return;fill(r);status.textContent='';loaded=true;}catch(ex){status.textContent=err(ex);again.hidden=false;}finally{pending=false;form.inert=!loaded;}}
 again.onclick=get;
 // Read only when this panel opens; the surrounding lesson owns tab navigation.
 const watch=new MutationObserver(()=>{if(!result.hidden)get();});watch.observe(result,{attributes:true,attributeFilter:['hidden']});if(!result.hidden)get();
 form.onsubmit=async ev=>{ev.preventDefault();if(!loaded||pending)return;const code=e.code.value.trim();if(code&&!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(code)){status.textContent='Мұғалім кодын толық енгізіңіз.';return;}if(!e.evidence.value.trim()){status.textContent='Өз ойыңызды бір сөйлеммен жазыңыз.';return;}
 if(e.evidence.value.trim().length>e.evidence.maxLength){status.textContent="Жауапты аздап қысқартыңыз.";return;}
 const args={p_lesson:l,p_step:Number(e.step.value),p_evidence:prefix(card)+e.evidence.value.trim(),p_helpful:e.helpful.value,p_difficulty:e.difficulty.value,p_note:e.note.value,p_code:code||null,p_keep:e.keep.checked,p_revision:revision};
 pending=true;form.inert=true;status.textContent='Сақталуда…';try{let r=await read('rpc/bridge_exit_save',args);r=Array.isArray(r)?r[0]:r;if(!r?.id||!r.revision)throw Error('no_receipt');if(state.user?.id!==owner||!box.isConnected)return;fill(r);status.textContent='Жауабыңыз сақталды. Сабақ ұпайы өзгерген жоқ.';}catch(ex){status.textContent=err(ex)+' Жауабыңыз осы бетте қалды.';}finally{pending=false;form.inert=false;}};
}
function teacher(root,store,state){const hub=root.querySelector('.teacher-hub');if(!hub||!isStaff(state.user)||hub.querySelector('[data-exit-report]'))return;
 const user=state.user,read=api(store,state,user.id),box=document.createElement('details');box.className='ex-card';box.dataset.exitReport='';hub.querySelector('.teacher-head')?.after(box);
 box.innerHTML='<summary><b>Сабақ соңындағы кері байланыс</b></summary><p>Әр білім алушының соңғы жауабы бір рет саналады. Өзіндік бағалау мен мұғалімнің белгісі сабақ ұпайына қосылмайды.</p><div class="ex-pair"><label>Сабақ<select data-lesson>'+options(Object.fromEntries(Object.entries(lessons).map(([k,v])=>[k,v.title])))+'</select></label><label>Қатысушылар<select data-audience>'+options({all:'Барлығы',...audience})+'</select></label></div>'+(user.role==='admin'?'<label><input type="checkbox" data-all> Барлық топтың жиынтық санағы</label>':'')+'<button type="button" data-refresh>Жаңарту</button><p role="status" data-report-status></p><div data-counts></div><div data-inbox></div><button type="button" data-more hidden>Келесі жауаптар →</button>';
 const $=s=>box.querySelector(s);let version=0,offset=0;
 const tally=(rows,key,labels)=>{const counts={};rows.forEach(r=>{counts[r[key]]=(counts[r[key]]||0)+Number(r.responses);});return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>h(labels[k])+' — '+v).join(' · ')||'Әзірге жауап жоқ';};
 async function refresh(more=false){const ver=++version,l=$('[data-lesson]').value,a=$('[data-audience]').value,all=!!$('[data-all]')?.checked;const active=()=>ver===version&&box.isConnected&&state.user?.id===user.id;
 if(!more){offset=0;$('[data-inbox]').replaceChildren();$('[data-counts]').replaceChildren();}$('[data-more]').hidden=true;$('[data-report-status]').textContent='Жүктелуде…';
 try{if(!more){const rows=await read('rpc/bridge_exit_stats',{p_lesson:l,p_audience:a,p_all:all});if(!active())return;
 $('[data-counts]').innerHTML='<h3>'+rows.reduce((s,r)=>s+Number(r.responses),0)+' қатысушы жауап берді</h3><p><b>Қайталауға сұралған ұғымдар:</b> '+tally(rows,'difficulty',topics(l))+'</p><p><b>Көмектескен материал:</b> '+tally(rows,'helpful',helps)+'</p><p><b>Өзіндік бағалау:</b> '+tally(rows,'step',Object.fromEntries(steps.map((v,i)=>[i+1,v])))+'</p>';}
 if(!all){const answers=await read('rpc/bridge_exit_inbox',{p_lesson:l,p_audience:a,p_offset:offset});if(!active())return;
 for(const r of answers.slice(0,20)){const card=document.createElement('article');card.className='ex-response';card.innerHTML='<h4>'+h(audience[r.audience])+' · '+h(steps[r.step-1])+'</h4><p>'+h(r.evidence)+'</p>'+(r.note?'<p>Пікірі: '+h(r.note)+'</p>':'')+'<p>Қайталау: '+h(topics(l)[r.difficulty])+'</p><label>Дәлелге белгі <select><option value="">Белгі таңдаңыз</option>'+options(marks)+'</select></label> <button type="button">Белгіні сақтау</button><p role="status"></p>';const select=card.querySelector('select'),btn=card.querySelector('button');if(chosen(r.evidence)||!bridgeLessons[l]){select.parentElement.hidden=true;btn.hidden=true;}select.value=r.review||'';btn.onclick=async()=>{if(!select.value)return;btn.disabled=true;try{await read('rpc/bridge_exit_review',{p_id:r.id,p_revision:r.revision,p_mark:select.value});card.querySelector('[role=status]').textContent='Белгі сақталды.';}catch(ex){card.querySelector('[role=status]').textContent=err(ex);}finally{btn.disabled=false;}};$('[data-inbox]').append(card);}
 offset+=Math.min(20,answers.length);$('[data-more]').hidden=answers.length<=20;}
 if(active())$('[data-report-status]').textContent=all?'Жалпы санақта жеке мәтіндер көрсетілмейді.':'Тек өз кодыңызбен жіберілген жауаптар.';}
 catch(ex){if(active())$('[data-report-status]').textContent=err(ex);}}
 box.ontoggle=()=>{if(box.open)refresh();};for(const el of box.querySelectorAll('[data-lesson],[data-audience],[data-all]'))el.onchange=()=>refresh();$('[data-refresh]').onclick=()=>refresh();$('[data-more]').onclick=()=>refresh(true);
}
const uniPath='/universitet/teoriya', labPath='/universitet/ozin-ozi-daiyndau';
function reflectionTopic(title,topics){return {title,topics,school:'Сабақта не байқадың? Оны досыңа қалай түсіндірер едің?',uni:'Осы сабақ мектептен білетін ұғымыңа не қосты? Бір мысал келтіріңіз.'};}
function folded(root,host,key,state,store){
 if(!host||Array.from(host.children).some(n=>n.dataset.reflectionKey===key))return;
 const d=document.createElement('details'),s=document.createElement('summary');d.dataset.reflectionKey=key;d.className='ex-fold';s.textContent='Ой колбасы · сабақ рефлексиясы';d.append(s);host.append(d);
 d.ontoggle=()=>{if(d.open)learner(root,key,store,state,d);};
}
export function bindBridgeExit(root,{state,store,units=[]}){
 const items=(state.items||[]).filter(i=>i.is_published!==false&&i.area==='university'),path=location.pathname.replace(/^\/himya-platforma(?=\/|$)/,'').replace(/\/$/,'');
 for(const k of Object.keys(lessons))if(!bridgeLessons[k])delete lessons[k];
 for(const u of units)lessons['school:'+u.slug]=reflectionTopic(u.grade+'-сынып · '+u.title,u.topics.slice(0,3).map((t,i)=>[t,'school-concept-'+i]));
 const studyTopics=[['Сабақ материалын қайта ашу','exit-study-start']];
 for(const i of items){
  if(i.path.startsWith(labPath+'/')||i.path.startsWith(uniPath+'/')){
   const key='uni:'+i.id;lessons[key]=reflectionTopic('ЖОО · '+i.title,studyTopics);
   if(i.path===path){const host=root.querySelector('.lesson-main,.document-hub,.lms-curriculum');if(host){(root.querySelector('.lesson-head,.document-hub-head,.lms-course-head')||host).id='exit-study-start';folded(root,host,key,state,store);}}
  }
  if(i.path===uniPath)for(const file of state.resources?.[i.id]?.length?state.resources[i.id]:(state.allResources||[]).filter(r=>r.item_id===i.id)){
   const key='lecture:'+file.id,anchor='exit-file-'+String(file.id).replace(/[^\w-]/g,'');
   lessons[key]=reflectionTopic('Дәріс · '+file.filename,[['Дәріс материалы',anchor]]);
   if(path===i.path){const open=Array.from(root.querySelectorAll('[data-open-resource]')).find(b=>b.dataset.openResource===String(file.id));const host=open?.closest('.resource-card,article')||open?.parentElement?.parentElement;if(host){host.id=anchor;folded(root,host,key,state,store);}}
  }
 }
 const unit=root.querySelector('[data-school-unit]')?.dataset.schoolUnit;
 if(unit&&lessons['school:'+unit]){
  const resultTab=root.querySelector('#school-tab-results');
  if(resultTab?.getAttribute('aria-selected')==='true')learner(root,'school:'+unit,store,state,root.querySelector('#school-panel'));
  else if(resultTab&&!root.querySelector('[data-exit-shortcut]')){const b=document.createElement('button');b.type='button';b.className='secondary-button';b.dataset.exitShortcut='';b.textContent='Ой колбасы · сабақ рефлексиясы →';root.querySelector('.school-hero')?.append(b);b.onclick=()=>{resultTab.click();root.querySelector('[data-exit] h2')?.focus();};}
 }
 for(const l of Object.keys(bridgeLessons))learner(root,l,store,state);teacher(root,store,state);
}
