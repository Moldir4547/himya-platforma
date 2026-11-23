import {BOOKS,AUTHORS,MODULES,checkNumber} from './university-exercises-data.js';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topic=$('exercise-topic'),content=$('exercise-content'),params=new URLSearchParams(location.search);
let mode=params.get('mode')==='bozh'?'bozh':'boozh';
topic.innerHTML=MODULES.map((m,i)=>'<option value="'+m.id+'">'+(i+1)+'. '+esc(m.title)+'</option>').join('');
if(MODULES.some(m=>m.id===params.get('topic')))topic.value=params.get('topic');
const steps=t=>'<ol>'+t.steps.map(([how,why])=>'<li><strong>'+esc(how)+'</strong><p>'+esc(why)+'</p></li>').join('')+'</ol><p class="exercise-answer"><strong>Дұрыс жауап:</strong> '+esc(t.answer)+'</p>';
function workboard(id){
 return '<details class="exercise-board" open><summary>Жұмыс тақтасы</summary><p>Формула мен есептеуді жазыңыз. Сызу керек болса, төмендегі торды пайдаланыңыз.</p><label>Шешу жазбасы<textarea data-notes maxlength="5000" placeholder="Берілгені → формула → есептеу → қорытынды"></textarea></label><svg viewBox="0 0 600 310" aria-label="Сызуға арналған тор" data-drawing><title>Сызуға арналған тор</title></svg><div class="exercise-tools"><button type="button" data-undo disabled>Соңғы сызықты өшіру</button></div><p class="exercise-save" data-save>Жазба мен сызба осы браузерде сақталады.</p></details>';
}
function exercise(task,name,id){
 let ref='';
 if(task.book){const b=BOOKS[task.book];ref='<p class="exercise-ref">'+esc(b.title)+' ('+b.year+'), '+task.page+'-бет (PDF: '+(task.page+b.pdfOffset)+'-бет) · '+esc(task.number)+'. Шарттың мәтіні ықшамдалды немесе тексеруге бейімделді.</p>';}
 const [, ,unit]=task.check;
 return '<section class="exercise-card" data-task="'+id+'"><h3>'+esc(name)+'</h3>'+ref+'<p>'+esc(task.prompt)+'</p>'+workboard(id)+'<form class="exercise-check"><label>Сандық жауап'+(unit?' ('+esc(unit)+')':'')+'<input type="text" inputmode="decimal" maxlength="30" autocomplete="off"></label><button class="primary" type="submit">Жауапты тексеру</button></form><p class="exercise-feedback" role="status"></p><details><summary>Алғашқы қадамға көмек</summary><p>'+esc(task.steps[0][1])+'</p></details><details data-solution><summary>Толық шешу жолы мен дұрыс жауап</summary>'+steps(task)+'</details></section>';
}
function render(focus=false){
 const m=MODULES.find(v=>v.id===topic.value)||MODULES[0];
 document.querySelectorAll('[data-mode]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.mode===mode)));
 const query=new URLSearchParams({mode,topic:m.id});
 history.replaceState(null,'','?'+query);
 content.innerHTML='<h2 tabindex="-1">'+esc(m.title)+'</h2>'+(
  mode==='boozh'?'<section class="exercise-card" data-task="example"><h3>БӨОЖ · оқытушымен талданатын үлгі</h3><p>'+esc(m.example.prompt)+'</p>'+steps(m.example)+workboard('example')+'</section>'
  :exercise(m.practice,'БӨЖ · ұқсас есепті өзіңіз шығарыңыз','practice')+exercise(m.homework,'Кітаптағы үй тапсырмасына көмек','homework')
 )+'<section class="exercise-card"><h3>Оқу көздері</h3><p>'+esc(AUTHORS)+'</p><ul>'+m.pages.map(([key,r])=>'<li><cite>'+esc(BOOKS[key].title)+'</cite> ('+BOOKS[key].year+'), '+esc(r)+'-беттер.</li>').join('')+'</ul>'+[m.video,m.extraVideo].filter(Boolean).map(([id,title])=>'<p><a class="exercise-video" href="https://www.youtube.com/watch?v='+encodeURIComponent(id)+'" target="_blank" rel="noopener noreferrer">YouTube: '+esc(title)+' ↗</a></p>').join('')+'</section>';
 content.querySelectorAll('[data-task]').forEach(card=>{
  const key=card.dataset.task;
  wireBoard(card,'cb-university-exercises-v1:'+m.id+':'+key);
  const form=card.querySelector('form');if(!form)return;
  form.onsubmit=ev=>{
   ev.preventDefault();
   const t=m[key],input=form.querySelector('input'),[n,tol]=t.check,res=checkNumber(input.value,n,tol),msg=card.querySelector('.exercise-feedback');
   msg.className='exercise-feedback '+(res===true?'exercise-good':res===false?'exercise-miss':'');
   input.setAttribute('aria-invalid',String(res!==true));
   msg.textContent=res===null?'Санды өлшем бірлігінсіз енгізіңіз. Ондық үтір де, нүкте де жарайды.':res?'Сандық жауап дұрыс. Шешу жолыңызды үлгімен салыстырыңыз.':'Жауап сәйкес келмеді. Бірліктерді тексеріңіз немесе алғашқы қадамға көмекті ашыңыз.';
   if(res===true)card.querySelector('[data-solution]').open=true;
  };
 });
 if(focus)content.querySelector('h2')?.focus({preventScroll:true});
}
function wireBoard(card,key){
 const notes=card.querySelector('[data-notes]'),svg=card.querySelector('[data-drawing]'),undo=card.querySelector('[data-undo]'),saveLine=card.querySelector('[data-save]');
 let lines=[],pointer=null,active=null;
 try{const old=JSON.parse(localStorage.getItem(key));notes.value=String(old?.notes||'').slice(0,5000);if(Array.isArray(old?.lines))lines=old.lines.slice(-50).filter(path=>Array.isArray(path)&&path.length&&path.length<=600&&path.every(pt=>Array.isArray(pt)&&pt.length===2&&pt.every(Number.isFinite)));}catch{}
 const pts=line=>line.map(q=>q.join(',')).join(' ');
 const renderLine=line=>{
  const el=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  el.setAttribute('points',pts(line));el.setAttribute('fill','none');el.setAttribute('stroke','currentColor');el.setAttribute('stroke-width','2.5');el.setAttribute('stroke-linecap','round');el.setAttribute('stroke-linejoin','round');
  svg.append(el);return el;
 };
 const draw=()=>{svg.querySelectorAll('polyline').forEach(el=>el.remove());lines.forEach(renderLine);undo.disabled=!lines.length;};
 const save=()=>{try{localStorage.setItem(key,JSON.stringify({notes:notes.value,lines}));saveLine.textContent='Жазба мен сызба осы браузерде сақталды.';}catch{saveLine.textContent='Сақтау мүмкін болмады. Осы бет ашық тұрғанда жұмысты жалғастыра аласыз.';}};
 function point(ev){const xy=new DOMPoint(ev.clientX,ev.clientY).matrixTransform(svg.getScreenCTM().inverse());return [Math.round(Math.max(0,Math.min(600,xy.x))),Math.round(Math.max(0,Math.min(310,xy.y)))];}
 svg.addEventListener('pointerdown',ev=>{
  if(pointer!==null||ev.button!==0)return;
  ev.preventDefault();pointer=ev.pointerId;svg.setPointerCapture(ev.pointerId);
  const q=point(ev);if(lines.length===50)lines.shift();
  lines.push([q,[q[0]+0.01,q[1]]]);draw();active=svg.lastElementChild;
 });
 svg.addEventListener('pointermove',ev=>{if(pointer!==ev.pointerId)return;const line=lines.at(-1);if(line.length<600){line.push(point(ev));active.setAttribute('points',pts(line));}});
 function done(ev){if(ev.pointerId!==pointer)return;pointer=null;active=null;save();}
 svg.addEventListener('pointerup',done);svg.addEventListener('pointercancel',done);svg.addEventListener('lostpointercapture',done);
 undo.onclick=()=>{if(pointer!==null)return;lines.pop();draw();save();};
 notes.addEventListener('input',save);
 draw();
}
topic.onchange=()=>render(true);
document.querySelectorAll('[data-mode]').forEach(btn=>btn.onclick=()=>{mode=btn.dataset.mode;render(true);});
render();