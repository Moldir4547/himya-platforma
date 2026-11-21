import {TOPICS} from './teacher-games-data.js';
import {crossword,letters} from './teacher-crossword.js';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const opts=(items,selected)=>items.map(([id,label])=>'<option value="'+esc(id)+'"'+(String(id)===String(selected)?' selected':'')+'>'+esc(label)+'</option>').join('');
const names={cross:'Кроссворд',match:'Терминдер жұбы',code:'Химиялық код'};
const params=new URLSearchParams(location.search);
const initial=TOPICS.find(t=>t.id===params.get('topic'));
$('level').value=initial?.level||(params.get('level')==='university'?'university':'school');
$('grade').innerHTML=opts([7,8,9,10,11].map(n=>[n,n+'-сынып']),initial?.grade||7);
let mode=Object.hasOwn(names,params.get('mode'))?params.get('mode'):'cross';
const score=msg=>{$('result').textContent=msg;};
const shuffled=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function catalog(selected){
 const level=$('level').value;
 $('grade-label').hidden=level!=='school';
 const visible=TOPICS.filter(t=>t.level===level&&(level==='university'||t.grade===Number($('grade').value)));
 $('topic').innerHTML=opts(visible.map(t=>[t.id,t.title]),selected);
 render();
}
function crossView(topic){
 const {width,height,words}=crossword(topic.terms);
 const cells=new Map();
 for(const {num,x,y,word,horizontal} of words){
  Array.from(word,(letter,i)=>{
   const k=(x+(horizontal?i:0))+','+(y+(horizontal?0:i));
   const c=cells.get(k)||{letter,starts:[],positions:[]};
   if(!i)c.starts.push(num);
   c.positions.push(num+'-сөздің '+(i+1)+'-әрпі');cells.set(k,c);
  });
 }
 const rows=Array.from({length:height*width},(_,i)=>{
  const k=i%width+','+Math.floor(i/width),c=cells.get(k);
  return c?'<div class="cell"><b aria-hidden="true">'+c.starts.join('/')+'</b><input type="text" id="p'+i+'" maxlength="1" autocomplete="off" spellcheck="false" aria-label="'+c.positions.join(', ')+'"></div>':'<div class="cell" aria-hidden="true"></div>';
 }).join('');
 return {markup:'<p>Әр торға бір әріп жазыңыз. Бос орын мен дефис торға жазылмайды; бағыттау пернелерімен жылжуға болады.</p><div class="grid-row"><div class="board-scroll"><div class="board" style="grid-template-columns:repeat('+width+',auto)">'+rows+'</div></div><ol class="clues">'+words.map(w=>'<li><strong>'+(w.horizontal?'Көлденең':'Тігінен')+' · '+w.word.length+' әріп:</strong> '+esc(w.clue)+'</li>').join('')+'</ol></div>',
 bind(form){
  const boxes=[...form.querySelectorAll('.cell input')];
  form.addEventListener('keydown',event=>{
   if(!event.target.matches('.cell input'))return;
   const move={ArrowLeft:-1,ArrowRight:1,ArrowUp:-width,ArrowDown:width}[event.key];
   if(!move)return;const i=Number(event.target.id.slice(1)),next=i+move;
   if((event.key==='ArrowLeft'||event.key==='ArrowRight')&&Math.floor(i/width)!==Math.floor(next/width))return;
   const dest=$('p'+next);if(dest){event.preventDefault();dest.focus();dest.select();}
  });
  form.addEventListener('input',event=>{if(event.target.matches('.cell input')){event.target.value=letters(event.target.value).slice(0,1);delete event.target.dataset.state;}});
  return ()=>{
   let correct=0;
   for(const input of boxes){const n=Number(input.id.slice(1)),value=letters(input.value),ok=value===cells.get(n%width+','+Math.floor(n/width)).letter;correct+=Number(ok);input.dataset.state=value?(ok?'ok':'bad'):'';}
   score(correct===cells.size?'Кроссворд толық шешілді!':correct+' / '+cells.size+' әріп дұрыс. Белгіленген және бос торларды қайта қараңыз.');
  };
 }};
}
function matchView(topic){
 const choices=shuffled(topic.terms.map(([name],i)=>[i,name]));
 return {markup:'<p>Әр анықтамаға сәйкес бір термин таңдаңыз.</p>'+shuffled(topic.terms.map(([name,clue],i)=>[i,clue])).map(([i,clue])=>'<div class="task"><label>'+esc(clue)+'<select class="response" data-pair="'+i+'"><option value="">Термин таңдаңыз</option>'+opts(choices)+'</select></label><p class="feedback"></p></div>').join(''),
 bind(form){return ()=>{let correct=0;
  for(const select of form.querySelectorAll('[data-pair]')){
   const ok=select.value!==''&&select.value===select.dataset.pair;correct+=Number(ok);select.dataset.state=ok?'ok':'bad';
   select.closest('.task').querySelector('.feedback').textContent=ok?'Дұрыс.':'Анықтаманың негізгі белгісіне назар аударыңыз.';
  }
  score('Табылған жұп: '+correct+' / '+topic.terms.length+'.');
 };}};
}
function codeView(topic){
 const tasks=topic.tasks.filter(t=>Number.isFinite(t[1])).slice(0,2);
 return {markup:'<p>Есепті шығарып, жауапты санмен жазыңыз. Ондық бөлшекке үтір немесе нүкте қолдануға болады.</p>'+tasks.map(([q,n,unit],i)=>'<div class="task"><label>'+esc(q)+(unit&&unit!=='—'?' <small>('+esc(unit)+')</small>':'')+'<input class="response" type="text" inputmode="'+(n<0?'text':'decimal')+'" autocomplete="off" data-code="'+i+'" placeholder="Сандық жауап"></label><p class="feedback"></p></div>').join(''),
 bind(form){return ()=>{let correct=0;for(const input of form.querySelectorAll('[data-code]')){
   const [,answer,,why]=tasks[Number(input.dataset.code)],value=input.value.trim().replace(',','.').replace('−','-');
   const ok=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)&&Number.isFinite(Number(value))&&Math.abs(Number(value)-answer)<=Math.max(0.001,Math.abs(answer)*0.005);
   correct+=Number(ok);input.dataset.state=ok?'ok':'bad';input.closest('.task').querySelector('.feedback').textContent=value?(ok?'Дұрыс. ':'Қайта есептеңіз. ')+why:'Алдымен жауабыңызды енгізіңіз.';
  }score('Жиналған код: '+correct+' / '+tasks.length+'.');};
 }};
}
function render(){
 const topic=TOPICS.find(t=>t.id===$('topic').value);if(!topic)return;
 const url=new URL(location.href);url.search=new URLSearchParams({topic:topic.id,mode});history.replaceState(null,'',url);
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
 const v={cross:crossView,match:matchView,code:codeView}[mode](topic);
 $('game').innerHTML='<p class="eyebrow">'+(topic.grade?topic.grade+'-сынып':'Университет')+'</p><h2 id="game-title">'+esc(topic.title)+'</h2><p><strong>'+names[mode]+'</strong></p><form id="play">'+v.markup+'<div class="actions screen"><button class="primary" type="submit">Тексеру</button><button type="button" id="restart-game">Қайта бастау</button></div><p id="result" role="status"></p></form>';
 const form=$('play'),check=v.bind(form);
 form.addEventListener('submit',event=>{event.preventDefault();check();});
 $('restart-game').onclick=()=>{form.reset();for(const el of form.querySelectorAll('[data-state]'))delete el.dataset.state;for(const el of form.querySelectorAll('.feedback'))el.textContent='';score('Жаңа ойын басталды.');form.querySelector('input,select')?.focus();};
}
$('level').onchange=()=>catalog();$('grade').onchange=()=>catalog();$('topic').onchange=render;
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render();});
$('print').onclick=()=>window.print();
catalog(initial?.id);
