import {TABLE,SYMBOLS,ELEMENTS,PRACTICE,DEMOS,evaluateConfiguration,superscript} from './electron-shells-data.js';
const $=id=>document.getElementById(id);
const player=$('shell-game'),body=$('shell-table-body'),demos=$('shell-demos');
const storage='chembridge-electron-config-v1';
let records={},persistent=true,active;
const params=new URLSearchParams(location.search);
try{const parsed=JSON.parse(localStorage.getItem(storage)||'{}');records=parsed&&typeof parsed==='object'?parsed:{};}catch{persistent=false;}
const recorded=e=>{
 const r=records[e.z];
 if(!PRACTICE.includes(e)||!r||!['ok','wrong'].includes(r.result)||typeof r.input!=='string')return null;
 const checks=evaluateConfiguration(e,r.input);
 return checks===null?null:{...r,result:checks?'ok':'wrong'};
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
  b.querySelector('.shell-marker').textContent=r?.result==='ok'?'✓':r?'×':'';
  b.setAttribute('aria-label',e.name+', '+e.symbol+', атом нөмірі '+e.z+(r?.result==='ok'?', дұрыс':r?', жауабы ашылған':''));
 }
}
$('shell-table-head').innerHTML='<tr><th scope="col">Период</th>'+Array.from({length:18},(_,i)=>'<th scope="col">'+(i+1)+'</th>').join('')+'</tr>';
body.innerHTML=TABLE.map(({label,cells})=>'<tr><th scope="row">'+label+'</th>'+cells.map(z=>{
 if(!z)return '<td></td>';
 if(typeof z==='string'){
  const lanthanides=z==='57–71',name=lanthanides?'Лантаноидтар':'Актиноидтар';
  return '<td><button type="button" class="shell-series" data-series="'+(lanthanides?57:89)+'" aria-label="'+name+' '+z+' қатарына өту"><small>'+name+'</small><b>'+z+' ↓</b></button></td>';
 }
 return '<td><button type="button" data-z="'+z+'"><small>'+z+'</small><b>'+SYMBOLS[z-1]+'</b><span class="shell-marker" aria-hidden="true"></span></button></td>';
}).join('')+'</tr>').join('');
demos.innerHTML=DEMOS.map(z=>{
 const e=ELEMENTS[z-1];
 return '<details><summary>'+e.symbol+' · '+e.name+'</summary><p>'+config(e)+'</p></details>';
}).join('');
function render(focus=false){
 const e=active,prior=recorded(e),isLocked=Boolean(prior);
 const header='<h3 tabindex="-1">'+e.z+' · '+e.symbol+' — '+e.name+'</h3>';
  player.innerHTML=header+'<p>Толық электрондық конфигурацияны жазып, «Тексеру» батырмасын немесе Enter басыңыз.</p>'+
   '<form id="shell-form" novalidate><label>Электрондық конфигурация<input id="shell-input" type="text" enterkeyhint="done" maxlength="200" autocomplete="off" autocapitalize="off" spellcheck="false" '+(isLocked?'disabled':'')+'></label><button type="submit" class="primary" '+(isLocked?'disabled':'')+'>Тексеру</button></form>'+
   (isLocked?'<div class="shell-note '+(prior.result==='ok'?'shell-correct':'shell-wrong')+'"><p><b>'+(prior.result==='ok'?'Дұрыс!':'Қате жауап. Бұл тапсырма жабылды.')+'</b> Дұрыс жауап: ' +config(e)+'</p></div><button type="button" id="shell-next" class="primary">Келесі тапсырма →</button>':'<p id="shell-feedback" role="status"></p>');
  const form=$('shell-form');
  const input=$('shell-input');
  if(prior)input.value=prior.input;
  form.onsubmit=ev=>{
   ev.preventDefault();if(recorded(e))return;
   const value=input.value.trim(),result=evaluateConfiguration(e,value);
   if(result===null){
    $('shell-feedback').textContent='Жауапты 1s2 2s2 2p6 үлгісімен жазыңыз. Әр деңгейшені бір рет көрсетіңіз.';return;
   }
   records[e.z]={result:result?'ok':'wrong',input:value};
   save();render(true);
  };
  if($('shell-next'))$('shell-next').onclick=advance;
 update();
 if(focus){const h=player.querySelector('h3');h.focus({preventScroll:true});h.scrollIntoView({block:'nearest'});}
}
function select(z,focus=true){
 active=ELEMENTS[z-1];const url=new URL(location.href);url.searchParams.set('z',z);history.replaceState(null,'',url);render(focus);
}
$('shell-practice').onclick=()=>{const next=PRACTICE.find(e=>!recorded(e));if(next)select(next.z);else{const b=$('shell-practice');b.textContent='Барлық тапсырма тексерілді';b.disabled=true;}};
function advance(){
 const next=PRACTICE.find(e=>e.z>active.z&&!recorded(e))||PRACTICE.find(e=>!recorded(e));
 if(next)select(next.z);else{const b=$('shell-next');b.textContent='Барлық тапсырма тексерілді';b.disabled=true;}
}
body.addEventListener('click',ev=>{
 const series=ev.target.closest('[data-series]');
 if(series){
  const first=body.querySelector('[data-z="'+series.dataset.series+'"]');
  first?.focus();
  first?.scrollIntoView({block:'nearest',inline:'nearest'});
  return;
 }
 const b=ev.target.closest('[data-z]');if(b)select(Number(b.dataset.z));
});
window.addEventListener('storage',event=>{
 if(event.key!==storage||!event.newValue)return;
 try{Object.assign(records,JSON.parse(event.newValue));render();}catch{}
});
const z=Number(params.get('z'));select(Number.isInteger(z)&&z>=1&&z<=ELEMENTS.length?z:1,false);
