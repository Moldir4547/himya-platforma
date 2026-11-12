import {DIAGNOSTIC_BANK,DIAGNOSTIC_VERSION,DIMENSIONS} from './bridge-diagnostic-data.js';
import {readingId} from './bridge-book.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const diagnosticKey=owner=>'chembridge.diagnostic.'+DIAGNOSTIC_VERSION+'.'+encodeURIComponent(owner);
export function questionSet(topic,phase){return (DIAGNOSTIC_BANK[topic]||[]).map(pair=>pair[phase==='baseline'?0:1]);}
export function gradeDiagnostic(topic,phase,answers){
 const qs=questionSet(topic,phase);
 if(!['baseline','followup'].includes(phase)||qs.length!==3||!Array.isArray(answers)||answers.length!==3)return null;
 if(qs.some((q,i)=>!Number.isInteger(answers[i])||answers[i]<0||answers[i]>=q.options.length))return null;
 return answers.map((a,i)=>({correct:a===qs[i].answer,tag:qs[i].tag,step:qs[i].step}));
}
const stamp=s=>typeof s==='string'&&Number.isFinite(Date.parse(s))?s:null;
export function sanitizeDiagnostic(value){
 const out={version:DIAGNOSTIC_VERSION,participant:'',topics:{}};
 if(value?.version!==DIAGNOSTIC_VERSION)return out;
 if(typeof value.participant==='string'&&/^CB-[a-f0-9-]{8,80}$/i.test(value.participant))out.participant=value.participant;
 for(const topic of Object.keys(DIAGNOSTIC_BANK)){
  const raw=value.topics?.[topic];if(!raw)continue;
  const clean=(a,phase)=>{
   if(!a||!stamp(a.started))return null;
   const qs=questionSet(topic,phase),answers=qs.map((q,i)=>Number.isInteger(a.answers?.[i])&&a.answers[i]>=0&&a.answers[i]<q.options.length?a.answers[i]:null);
   const end=stamp(a.ended),ended=end&&Date.parse(end)>=Date.parse(a.started)&&gradeDiagnostic(topic,phase,answers)?end:null;
   return {started:a.started,ended,answers};
  };
  const baseline=clean(raw.baseline,'baseline');
  const followups=[];
  if(baseline?.ended&&Array.isArray(raw.followups)){
   for(const a of raw.followups){
    const v=clean(a,'followup');
    if(!v||Date.parse(v.started)<Date.parse(baseline.ended)||followups.at(-1)&&!followups.at(-1).ended)break;
    followups.push(v);
   }
  }
  out.topics[topic]={baseline,followups};
 }
 return out;
}
export function diagnosticCsv(data){
 const rows=[['participant_code','topic','phase','attempt','dimension','question_id','answer_index','correct','error_tag','started_at','ended_at','attempt_seconds']];
 for(const [topic,record] of Object.entries(data.topics)){
  if(!DIAGNOSTIC_BANK[topic])continue;
  for(const [phase,attempts] of [['baseline',[record.baseline]],['followup',record.followups]]){
   attempts.forEach((a,n)=>{
    if(!a?.ended)return;const g=gradeDiagnostic(topic,phase,a.answers);if(!g)return;
    g.forEach((result,i)=>rows.push([data.participant,topic,phase,n+1,DIMENSIONS[i],topic+'-'+phase+'-'+i,a.answers[i],result.correct?1:0,result.correct?'':result.tag,a.started,a.ended,Math.max(0,Math.round((Date.parse(a.ended)-Date.parse(a.started))/1000))]));
   });
  }
 }
 const cell=v=>'"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replace(/"/g,'""')+'"';
 return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
export function createBridgeDiagnostic({section,state,ladders}){
 const owner=state.user?.id,host=section.querySelector('[data-cb-diagnostic]');
 if(!owner||!host)return {show(){}};
 const key=diagnosticKey(owner),identity=()=>state.user?.id===owner;
 let current='bond',notice='',snapshot=null,data=sanitizeDiagnostic(null);
 try{snapshot=localStorage.getItem(key);data=sanitizeDiagnostic(JSON.parse(snapshot||'null'));}catch{notice='Сақталған диагностиканы оқу мүмкін болмады. Осы бетте орындауға болады.';}
 if(!data.participant)data.participant='CB-'+crypto.randomUUID();
 function persist(){
  if(!identity())return;
  try{if(localStorage.getItem(key)!==snapshot){notice='Басқа терезеде нәтиже өзгерген. Осы беттегі нәтижені CSV-ге жүктеп алып, бетті жаңартыңыз; бұрынғы жазба үстінен сақталмады.';return;}const next=JSON.stringify(data);localStorage.setItem(key,next);snapshot=next;notice='Осы браузерде аккаунтыңыз үшін сақталды.';}
  catch{notice='Сақталмады: жауаптар қазір бетте тұр. Бетті жаппай, аяқталған нәтижені CSV арқылы жүктеп алыңыз.';}
 }
 function record(){return data.topics[current]||(data.topics[current]={baseline:null,followups:[]});}
 function active(){
  const r=record();
  if(r.baseline&&!r.baseline.ended)return {phase:'baseline',attempt:r.baseline};
  const last=r.followups.at(-1);
  return last&&!last.ended?{phase:'followup',attempt:last}:null;
 }
 function feedback(phase,a){
  if(!a?.ended)return '';
  const qs=questionSet(current,phase),grade=gradeDiagnostic(current,phase,a.answers);
  return '<div class="bd-feedback">'+grade.map((g,i)=>'<article class="'+(g.correct?'bd-correct':'bd-wrong')+'"><h5>'+esc(DIMENSIONS[i])+' · '+(g.correct?'✓ Дұрыс':'Қайталау қажет')+'</h5><p>'+esc(qs[i].prompt)+'</p><p>Сіздің жауабыңыз: '+esc(qs[i].options[a.answers[i]])+'</p><p><b>Дұрыс жауап:</b> '+esc(qs[i].options[qs[i].answer])+'</p><p>'+esc(qs[i].why)+'</p>'+(!g.correct?'<a href="#'+readingId(current,g.step)+'">Осы қатеге қатысты түсіндірмені оқу →</a>':'')+'</article>').join('')+'</div>';
 }
 function map(){
  return '<details class="bd-map"><summary>Менің сабақтастық картам · 8 тақырып</summary><p>Әр бағытта бір сұрақ бар. «1/1» осы сұрақтың дұрыс орындалғанын көрсетеді; толық меңгеру деңгейі деп есептелмейді. «—» — әлі орындалмаған.</p><div class="bd-map-grid">'+ladders.map(t=>{
   const r=data.topics[t.id],b=r?.baseline?.ended?gradeDiagnostic(t.id,'baseline',r.baseline.answers):null;
   const finished=(r?.followups||[]).filter(a=>a.ended),first=finished[0],last=finished.at(-1),p=last?gradeDiagnostic(t.id,'followup',last.answers):null;
   return '<article><h5>'+esc(t.title)+'</h5><dl>'+DIMENSIONS.map((label,i)=>'<div><dt>'+esc(label)+'</dt><dd>Бастапқы: '+(b?(b[i].correct?'1/1':'0/1'):'—')+' · Кейінгі: '+(p?(p[i].correct?'1/1':'0/1'):'—')+'</dd></div>').join('')+'</dl><small>Кейінгі әрекет: '+(last?finished.length:'—')+'. Оқушыға түсіндіру дағдысы бұл сұрақтармен бағаланбайды.</small><button type="button" data-bd-topic="'+t.id+'">'+(!b?'Диагностиканы бастау':!p?'Оқып, басқа сұрақпен тексеру':p.some(x=>!x.correct)?'Қатемен жұмыс жасау':'Нәтижені қарау')+'</button></article>';
  }).join('')+'</div></details>';
 }
 function render(){
  if(!identity())return;
  const r=record(),a=active(),title=ladders.find(t=>t.id===current).title;
  let body='';
  if(a){
   const qs=questionSet(current,a.phase);
   body='<form data-bd-form><h5 tabindex="-1">'+(a.phase==='baseline'?'Бастапқы диагностика':'Оқудан кейінгі тексеру')+' · '+esc(title)+'</h5><p>Үш сұраққа жауап беріңіз. Түсіндірмелер барлық жауап жіберілген соң ашылады.</p>'+qs.map((q,i)=>'<fieldset><legend>'+(i+1)+'. '+esc(DIMENSIONS[i])+': '+esc(q.prompt)+'</legend>'+q.options.map((o,k)=>'<label><input type="radio" name="bd-'+i+'" value="'+k+'" '+(a.attempt.answers[i]===k?'checked':'')+'><span>'+esc(o)+'</span></label>').join('')+'</fieldset>').join('')+'<p data-bd-error role="alert"></p><button type="submit">Үш жауапты тексеру</button></form>';
  }else if(!r.baseline){
   body='<p>Алдымен 3 сұрақпен тірек біліміңізді тексеріңіз. Кейін теорияны оқып, басқа сұрақтарға жауап беріңіз. Бастапқы нәтиже өзгермей сақталады.</p><button type="button" data-bd-start="baseline">Өз деңгейімді анықтау · 3 сұрақ</button>';
  }else{
   const posts=r.followups.filter(x=>x.ended),last=posts.at(-1),first=posts[0];
   const b=gradeDiagnostic(current,'baseline',r.baseline.answers),p=last?gradeDiagnostic(current,'followup',last.answers):null;
   body='<div class="bd-comparison" data-bd-result>'+DIMENSIONS.map((label,i)=>'<article><h5>'+esc(label)+'</h5><p>Бастапқы: <b>'+(b[i].correct?'1/1':'0/1')+'</b></p><p>Кейінгі: <b>'+(p?(p[i].correct?'1/1':'0/1'):'әлі орындалмаған')+'</b></p></article>').join('')+'</div><p class="bd-next"><b>Келесі қадам:</b> '+(!p?(b.some(g=>!g.correct)?'Төмендегі қателерге қатысты түсіндірмелерді оқып, басқа сұрақтармен тексеріңіз.':'Тақырыптың ЖОО қадамын оқып, басқа сұрақтармен білімді қолдануды тексеріңіз.'):p.some(g=>!g.correct)?'Қате қалған бағыттың түсіндірмесіне оралып, шешімін негіздеңіз.':'Кейінгі үш сұрақ дұрыс орындалды. Енді тақырыптағы авторлық өтпелі тапсырманы өз сөзіңізбен түсіндіріңіз.')+'</p>'+
   (last?'<p>Кейінгі әрекет №'+posts.length+'. Алғашқы кейінгі тексеру: '+gradeDiagnostic(current,'followup',first.answers).filter(g=>g.correct).length+'/3; соңғысы: '+p.filter(g=>g.correct).length+'/3.</p><details class="bd-latest" open><summary>Кейінгі жауаптар және қателер</summary>'+feedback('followup',last)+'</details>':'')+
   '<details class="bd-baseline" '+(!last?'open':'')+'><summary>Бастапқы жауаптар · өзгермейтін жазба</summary>'+feedback('baseline',r.baseline)+'</details><button type="button" data-bd-start="followup">'+(last?'Кейінгі сұрақтарды жаттығу ретінде қайталау':'Оқыдым · басқа сұрақтармен тексеру')+'</button><p class="bd-limit">Алғашқы кейінгі тексеруде басқа сұрақтар беріледі. Одан кейінгі қайталаулар сол сұрақтарды қолданады және жаңа тәуелсіз өлшем болып саналмайды. Сұрақтар — оқу үшін құрастырылған; валидтелген зерттеу шкаласы емес.</p>';
  }
  host.innerHTML='<section class="bd-panel" aria-label="Жеке сабақтастық диагностикасы"><h4>Өз деңгейіңді анықта → оқы → қайта тексер</h4><p class="bd-storage">Жауаптар осы браузерде, осы аккаунт үшін сақталады. Басқа құрылғыға және әкімші панеліне автоматты жіберілмейді. Нәтижені CSV файлына жүктей аласыз.</p>'+body+'<p data-bd-status role="status">'+esc(notice)+'</p>'+map()+'<button type="button" data-bd-export>Нәтижелерді CSV-ге жүктеу</button></section>';
 }
 host.addEventListener('change',e=>{
  if(!identity()||!e.target.matches('[data-bd-form] input[type=radio]'))return;
  const a=active(),i=Number(e.target.name.slice(3)),v=Number(e.target.value);
  if(!a||!Number.isInteger(i)||i<0||i>2||!questionSet(current,a.phase)[i].options[v])return;
  a.attempt.answers[i]=v;persist();host.querySelector('[data-bd-status]').textContent=notice;
 });
 host.addEventListener('submit',e=>{
  if(!e.target.matches('[data-bd-form]'))return;e.preventDefault();
  if(!identity())return;const a=active();if(!a)return;
  if(!gradeDiagnostic(current,a.phase,a.attempt.answers)){host.querySelector('[data-bd-error]').textContent='Үш сұрақтың әрқайсысына жауап таңдаңыз.';return;}
  a.attempt.ended=new Date().toISOString();persist();render();host.querySelector('h4').tabIndex=-1;host.querySelector('h4').focus();
 });
 host.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button||!host.contains(button)||!identity())return;
  if(button.hasAttribute('data-bd-start')){
   const r=record(),phase=button.dataset.bdStart;
   if(active()||phase==='baseline'&&r.baseline||phase==='followup'&&!r.baseline?.ended)return;
   const attempt={started:new Date().toISOString(),ended:null,answers:[null,null,null]};
   if(phase==='baseline')r.baseline=attempt;else r.followups.push(attempt);
   persist();render();host.querySelector('[data-bd-form] h5')?.focus();
  }
  if(button.hasAttribute('data-bd-topic')){
   const topic=button.dataset.bdTopic;
   section.querySelector('[data-cb-topic="'+topic+'"]')?.click();
   host.querySelector('h4').tabIndex=-1;host.querySelector('h4').focus();
  }
  if(button.hasAttribute('data-bd-export')){
   const csv=diagnosticCsv(data);
   if(csv.split('\r\n').length<2){notice='Алдымен диагностиканың үш сұрағын аяқтаңыз. Аяқталмаған әрекет экспортқа қосылмайды.';render();return;}
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');
   a.href=url;a.download='ChemBridge-diagnostic.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 });
 return {show(topic){if(!DIAGNOSTIC_BANK[topic]||!identity())return;current=topic;render();}};
}
