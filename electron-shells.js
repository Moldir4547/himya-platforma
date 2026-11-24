import {TABLE,SYMBOLS,ELEMENTS,PRACTICE,DEMOS,evaluate,superscript} from './electron-shells-data.js';
const $=id=>document.getElementById(id);
const player=$('shell-game'),body=$('shell-table-body'),demos=$('shell-demos');
const names=['K','L','M','N','O'],storage='chembridge-electron-shells-v1';
let records={},persistent=true,active,step=0;
const params=new URLSearchParams(location.search);
try{const parsed=JSON.parse(localStorage.getItem(storage)||'{}');records=parsed&&typeof parsed==='object'?parsed:{};}catch{persistent=false;}
const recorded=e=>{
 const r=records[e.z];
 if(!PRACTICE.includes(e)||!r||!['ok','wrong'].includes(r.result)||!Array.isArray(r.answers))return null;
 const checks=evaluate(e,r.answers);
 return checks?{...r,result:checks.every(Boolean)?'ok':'wrong'}:null;
};
const config=e=>e.terms.map(t=>t.orbital+superscript(t.count)).join(' ');
function save(){
 try{localStorage.setItem(storage,JSON.stringify(records));persistent=true;}catch{persistent=false;}
}
function update(){
 $('shell-score').textContent='Тексерілгені: '+PRACTICE.filter(recorded).length+' / '+PRACTICE.length+' · Дұрысы: '+PRACTICE.filter(e=>recorded(e)?.result==='ok').length;
 $('shell-storage').textContent=persistent?'Тексерілген тапсырмалар осы браузерде сақталады. Бір элементке бір әрекет беріледі.':'Браузерде сақтау қолжетімсіз. Жауаптар осы бет ашық тұрғанда ғана сақталады.';
 for(const b of body.querySelectorAll('[data-z]')){
  const e=ELEMENTS[Number(b.dataset.z)-1],r=recorded(e);
  b.setAttribute('aria-pressed',String(e===active));
  b.dataset.result=r?.result||'';
  b.querySelector('.shell-marker').textContent=DEMOS.includes(e.z)?'◇':r?.result==='ok'?'✓':r?'×':'';
  b.setAttribute('aria-label',e.name+', '+e.symbol+', атом нөмірі '+e.z+(r?.result==='ok'?', дұрыс':r?', жауабы ашылған':''));
 }
}
$('shell-table-head').innerHTML='<tr><th scope="col">Период</th>'+Array.from({length:18},(_,i)=>'<th scope="col">'+(i+1)+'</th>').join('')+'</tr>';
body.innerHTML=TABLE.map(({label,cells})=>'<tr><th scope="row">'+label+'</th>'+cells.map(z=>{
 if(!z)return '<td></td>';
 if(typeof z==='string')return '<td class="shell-muted">'+z+'</td>';
 return '<td>'+(z<=54?'<button type="button" data-z="'+z+'"><small>'+z+'</small><b>'+SYMBOLS[z-1]+'</b><span class="shell-marker" aria-hidden="true"></span></button>':'<span class="shell-muted"><small>'+z+'</small><b>'+SYMBOLS[z-1]+'</b></span>')+'</td>';
}).join('')+'</tr>').join('');
demos.innerHTML=DEMOS.map(z=>'<button type="button" data-demo="'+z+'">'+ELEMENTS[z-1].symbol+' · '+ELEMENTS[z-1].name+'</button>').join('');
function render(focus=false){
 const e=active,isDemo=DEMOS.includes(e.z),prior=recorded(e),isLocked=Boolean(prior);
 for(const b of demos.querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.demo)===e.z));
 const header='<h3 tabindex="-1">'+e.z+' · '+e.symbol+' — '+e.name+'</h3><p class="shell-config" aria-label="Электрондық конфигурация">'+config(e)+'</p>';
 if(isDemo){
  const current=e.terms[step-1];
  player.innerHTML=header+'<p><b>Қадамдық үлгі.</b> Әр қадамда бір деңгейшенің электрондарын тиісті қабатқа қосыңыз.</p>'+
   (current?'<p role="status" class="shell-note"><b>'+current.orbital+superscript(current.count)+'</b> → n = '+current.n+' қабатына '+current.count+' электрон қосылды.</p>':'')+
   (step<e.terms.length?'<button type="button" id="shell-step" class="primary">Келесі деңгейді қосу</button>':'<p class="shell-correct">Жауабы: '+e.shells.join(' · ')+'</p><button type="button" id="shell-start" class="primary">Өзім орындаймын →</button>')+
   (step?'<button type="button" id="shell-back">Үлгіні басынан қарау</button>':'');
  if($('shell-step'))$('shell-step').onclick=()=>{step++;render();($('shell-step')||$('shell-start')).focus();};
  if($('shell-back'))$('shell-back').onclick=()=>{step=0;render();$('shell-step').focus();};
  if($('shell-start'))$('shell-start').onclick=()=>advance();
 }else{
  player.innerHTML=header+'<p>Әр қабаттағы электрон санын жазып, Enter басыңыз.</p>'+
   '<form id="shell-form" novalidate><fieldset '+(isLocked?'disabled':'')+'><legend>Жауабыңыз</legend><div class="shell-fields">'+e.shells.map((_,i)=>
    '<label>'+names[i]+' (n = '+(i+1)+')<input data-shell type="text" inputmode="'+(i===e.shells.length-1?'text':'numeric')+'" enterkeyhint="'+(i===e.shells.length-1?'done':'next')+'" maxlength="2" autocomplete="off" value="'+(prior?Number(prior.answers[i]):'')+'"></label>'
   ).join('')+'</div></fieldset></form>'+
   (isLocked?'<div class="shell-note '+(prior.result==='ok'?'shell-correct':'shell-wrong')+'"><p><b>'+(prior.result==='ok'?'Дұрыс!':'Қате жауап. Бұл тапсырма жабылды.')+'</b> Дұрыс жауап: '+e.shells.join(' · ')+'</p></div><button type="button" id="shell-next" class="primary">Келесі тапсырма →</button>':'<p id="shell-feedback" role="status"></p>');
  const form=$('shell-form');
  form.addEventListener('keydown',ev=>{
   if(ev.key!=='Enter'||ev.isComposing||!ev.target.matches('[data-shell]'))return;
   ev.preventDefault();
   const fields=[...form.querySelectorAll('[data-shell]')],index=fields.indexOf(ev.target);
   if(index<fields.length-1){fields[index+1].focus();return;}
   form.requestSubmit();
  });
  form.onsubmit=ev=>{
   ev.preventDefault();if(recorded(e))return;
   const answers=[...form.querySelectorAll('[data-shell]')].map(el=>el.value.trim()),result=evaluate(e,answers);
   if(!result){
    $('shell-feedback').textContent='Барлық өріске бүтін сан жазыңыз.';return;
   }
   records[e.z]={result:result.every(Boolean)?'ok':'wrong',answers};
   save();render(true);
  };
  if($('shell-next'))$('shell-next').onclick=advance;
 }
 update();
 if(focus){const h=player.querySelector('h3');h.focus({preventScroll:true});h.scrollIntoView({block:'nearest'});}
}
function select(z,focus=true){
 active=ELEMENTS[z-1];step=0;const url=new URL(location.href);url.searchParams.set('z',z);history.replaceState(null,'',url);render(focus);
}
$('shell-practice').onclick=()=>{const next=PRACTICE.find(e=>!recorded(e));if(next)select(next.z);else{const b=$('shell-practice');b.textContent='Барлық тапсырма тексерілді';b.disabled=true;}};
function advance(){
 const next=PRACTICE.find(e=>e.z>active.z&&!recorded(e))||PRACTICE.find(e=>!recorded(e));
 if(next)select(next.z);else{const b=$('shell-next')||$('shell-start');b.textContent='Барлық тапсырма тексерілді';b.disabled=true;}
}
body.addEventListener('click',ev=>{const b=ev.target.closest('[data-z]');if(b)select(Number(b.dataset.z));});
demos.addEventListener('click',ev=>{const b=ev.target.closest('[data-demo]');if(b)select(Number(b.dataset.demo));});
window.addEventListener('storage',event=>{
 if(event.key!==storage||!event.newValue)return;
 try{Object.assign(records,JSON.parse(event.newValue));render();}catch{}
});
const z=Number(params.get('z'));select(Number.isInteger(z)&&z>=1&&z<=54?z:DEMOS[0],false);
