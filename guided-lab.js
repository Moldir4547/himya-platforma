import {LABS as DEFAULT_LABS} from './guided-lab-data.js';
import {fresh,validRecord,elapsed,completeStep} from './guided-lab-model.js';

export function mountGuidedLab(root,host){
'use strict';
const LABS=host.labs||DEFAULT_LABS,grade=host.grade||7;
let disposed=false;
const $=sel=>root.querySelector(sel);
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy=o=>JSON.parse(JSON.stringify(o));
let records={},active=host.selected||'hydrogen',dirty=false,task=null,saveTimer=null,selectedNote=0,resetArmed=false,saveBusy=false,flash='',generation=0;
let storageStatus='Өз бақылауыңызды жазып, сақтаңыз.';
for(const l of LABS)if(host.initial?.[l.id])records[l.id]=validRecord(l,host.initial[l.id]);
if(!LABS.some(l=>l.id===active))active=LABS[0].id;
const lab=()=>LABS.find(l=>l.id===active);
const state=()=>records[active]||(records[active]=fresh(lab()));
function pause(s){s.elapsedMs=elapsed(s);s.runningSince=null;}
function start(s){if(!s.finished&&s.runningSince===null)s.runningSince=Date.now();}
function clock(ms){const sec=Math.floor(ms/1000);return String(Math.floor(sec/3600)).padStart(2,'0')+':'+String(Math.floor(sec/60)%60).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function mark(){dirty=true;generation++;state().updatedAt=Date.now();storageStatus='Сақталмаған өзгеріс бар';showStorage();clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),1000);}
async function save(explicit=false){
 if(saveBusy||disposed)return false;
 if(host.admin){storageStatus='Әкімшіге арналған алдын ала қарау: жеке есеп сақталмайды.';showStorage();return false;}
 saveBusy=true;const owner=active,stamp=generation,snap=copy(state());snap.elapsedMs=elapsed(state());snap.runningSince=null;
 storageStatus='Сақталуда…';showStorage();
 try{await host.save(owner,snap);if(stamp===generation){dirty=false;storageStatus='Аккаунтыңызға сақталды · '+new Date().toLocaleTimeString('kk-KZ');}else storageStatus='Жаңа өзгерістер сақталуды күтеді.';}
 catch(e){dirty=true;storageStatus='Сақталмады: '+e.message+' Мәтін осы терезеде тұр. Қайта сақтаңыз.';}
 finally{saveBusy=false;if(!disposed){showStorage();if(stamp!==generation){clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(false),500);}}}return !dirty;
}
function showStorage(){const el=$('[data-save-status]');if(el)el.textContent=storageStatus;const b=$('[data-save]');if(b)b.disabled=saveBusy;}
function scene(l,s){
 if(host.scene)return host.scene(l,s,task);
 const k=l.kind,i=s.index+(task?1:0),gas=['hydrogen','zinc','carbonate'].includes(k),salt=k==='salt',temperature=k==='cooling'?[20,20,60,52,42,35,30][Math.min(i,6)]:k==='boiling'?[20,20,20,70,100,20,105][Math.min(i,6)]:null;
 let color='#b9dbe1',liquid=i>=2?42:0,solid='',bubbles=false,cloud=false,crystals=false,condensation=false,flame=false,funnel=false,magnet=false;
 if(gas){liquid=i>=4?38:0;solid=i>=3?'#9f9d8d':'';bubbles=i>=4;if(k==='zinc'){solid=i>=2?'#9f9d8d':'';liquid=i>=3?38:0;bubbles=i>=3;}if(k==='carbonate'){solid=i>=2?'#e0ddd0':'';liquid=i>=3?38:0;bubbles=i>=3;cloud=i===5;}}
 if(salt){liquid=i>=3&&i<7?44:0;cloud=i>=3&&i<6;funnel=i>=5;crystals=i>=7;solid=i<6&&i>=2?'#aa926b':'';}
 if(k==='mixture'){color=i>=6?'#303b40':'#d9cb6b';solid=i>=6?'#333b3e':i>=2?'#b4a553':'';magnet=i===4||i===7;liquid=i===5?35:0;}
 if(k==='signs'){liquid=i>=4?40:0;solid=i===2?'#6c4832':i===3?'#f1ead7':'';bubbles=i===4;color=i>=5?'#64bbdd':'#b9dbe1';cloud=i>=6;if(cloud)color='#54b9db';}
 if(k==='indicators'){liquid=i>=2?40:0;color=i===2?'#e96da7':i===3?'#df7887':'#9b7ac5';}
 if(k==='combustion'){liquid=0;solid='';flame=i>=2;}
 if(k==='neutralization'){liquid=i>=2?40:0;color=i===2||i===3?'#df7887':'#9b7ac5';crystals=i>=6;liquid=i>=6?0:liquid;}
 if(k==='cooling'){liquid=i>=2&&i<5?45:0;crystals=i>=5;solid='';}
 if(k==='boiling'){liquid=i>=2?48:0;bubbles=i===4||i>=6;solid='';}
 if(k==='candle'){condensation=i>=3;cloud=i>=4;flame=i>=2;liquid=0;solid='';}
 if(k==='food'){liquid=i>=2&&i<=3?40:0;color=i===3?'#9972c7':'#b9dbe1';solid=i>=5?'#343d63':'';}
 if(k==='breathing'){liquid=i>=1&&i<4?40:0;cloud=i>=3;condensation=i>=4;}
 const grains=solid?Array.from({length:15},(_,n)=>'<ellipse cx="'+(305+n*19%88)+'" cy="'+(290+n%4*5)+'" rx="5" ry="3" fill="'+solid+'"/>').join(''):'';
 const drops=condensation?Array.from({length:18},(_,n)=>'<ellipse cx="'+(307+n*23%90)+'" cy="'+(170+n*17%100)+'" rx="3" ry="5" fill="#8eb4c3"/>').join(''):'';
 const bubblesSvg=bubbles?Array.from({length:12},(_,n)=>'<circle class="cg-bubble" style="--delay:'+n*.1+'s" cx="'+(310+n*17%78)+'" cy="'+(275-n%4*18)+'" r="'+(2+n%4)+'" fill="none" stroke="#f4ffff" stroke-width="2"/>').join(''):'';
 const receiver=gas&&k!=='zinc'&&i>=2?'<path d="M350 145V88H578V188" fill="none" stroke="#83a8b6" stroke-width="8"/><path d="M350 145V88H578V188" fill="none" stroke="#d5e8ec" stroke-width="4"/><path d="M550 310V148a28 28 0 0 1 56 0v162" fill="url(#cgGlass)" stroke="#7999a4" stroke-width="3"/><path d="M553 '+(i>=6?220:288)+'h50v20h-50" fill="#8cb4c277"/><text x="530" y="351" class="cg-svg-label">Газ жинағыш</text>':'';
 const funnelSvg=funnel?'<path d="M275 85h155l-61 79v30h-30v-30z" fill="#d9e8e9aa" stroke="#7a9ca6" stroke-width="2"/><path d="M290 92h125l-63 64z" fill="#e9dfc5"/><path d="M315 100h78l-41 36z" fill="#b6a17c"/>':'';
 const crystalSvg=crystals?Array.from({length:12},(_,n)=>'<rect x="'+(302+n*23%91)+'" y="'+(288+n%3*7)+'" width="9" height="7" fill="#f7f2dc" stroke="#bac8c9"/>').join(''):'';
 const lamp=flame?'<rect x="330" y="265" width="30" height="62" rx="4" fill="#eee4c6"/><path class="cg-flame" d="M345 261q-20-22 0-48 22 28 0 48" fill="#e8b365"/>':'';
 const phase=task?'Әрекет орындалуда':s.index===l.steps.length?'Тәжірибе аяқталды':s.index?l.steps[s.index-1].label:'Құралдарды үстелге орналастырыңыз';
 return '<div class="cg-visual '+(s.runningSince===null?'paused':'')+'"><svg viewBox="0 0 760 400" role="img" aria-label="'+esc(l.title)+' тәжірибе көрінісі"><defs><linearGradient id="cgGlass"><stop stop-color="#c1dce122"/><stop offset=".15" stop-color="#ffffff88"/><stop offset=".5" stop-color="#b2cdd522"/><stop offset=".85" stop-color="#ffffff77"/></linearGradient><linearGradient id="cgWall" x2="0" y2="1"><stop stop-color="#dee8e3"/><stop offset="1" stop-color="#bfd4ca"/></linearGradient></defs><rect width="760" height="400" fill="url(#cgWall)"/><path d="M0 70h760M0 140h760M0 210h760M0 280h760M90 0v330M270 0v330M450 0v330M630 0v330" stroke="#b3c7bc" opacity=".35"/><path d="M0 333h760v67H0z" fill="#496960"/><path d="M0 338h760" stroke="#87a797" stroke-width="5"/><ellipse cx="370" cy="334" rx="158" ry="13" fill="#24483c33"/><path d="M190 330V56M150 331h90M190 145h105" fill="none" stroke="#5f7478" stroke-width="7"/><g class="cg-main-vessel"><path d="M290 145h126v155q-63 23-126 0z" fill="url(#cgGlass)" stroke="#6f94a1" stroke-width="2.5"/>'+(liquid?'<path d="M293 '+(300-liquid*2)+'q60-8 120 0V299q-60 20-120 0z" fill="'+color+'" opacity=".68"/>':'')+'<path d="M302 154v130" stroke="#fff" stroke-width="4" opacity=".7"/>'+grains+(cloud?'<ellipse cx="352" cy="277" rx="53" ry="20" fill="'+(k==='signs'?'#43b5de':k==='carbonate'||k==='breathing'||k==='candle'?'#e9ecdf':'#b29f7b')+'" opacity=".6"/>':'')+crystalSvg+bubblesSvg+drops+'</g>'+(gas&&k!=='zinc'&&i>=2?'<rect x="287" y="136" width="132" height="12" rx="3" fill="#8b7766"/>':'')+receiver+funnelSvg+lamp+(magnet?'<path d="M453 180v35a20 20 0 0 0 40 0v-35" fill="none" stroke="#b96761" stroke-width="14"/>':'')+(temperature!==null?'<rect x="455" y="38" width="120" height="40" rx="7" fill="#edf3e9"/><text x="469" y="65" class="cg-temp">'+temperature+' °C</text>':'')+'<text x="25" y="375" class="cg-stage-caption">'+esc(gas?(k==='carbonate'?'Газ: CO₂':k==='combustion'?'Орта: ауа / O₂':'Газ: H₂'):'Оқу моделі · көрсеткіштер үлгілік')+'</text></svg></div><p class="cg-scene-caption">'+esc(phase)+'</p>';
}
function notebook(l,s){return '<section class="cg-notebook"><div class="cg-section-head"><h2>Менің бақылауларым</h2><span>Дайын жауап берілмейді</span></div>'+l.steps.map((st,i)=>'<details '+(i===selectedNote&&i<s.index?'open':'')+' class="cg-note '+(i<s.index?'available':'')+'"><summary>'+String(i+1).padStart(2,'0')+' · '+esc(st.label)+' <span>'+((s.notes[i]||'').trim()?'Жазба бар':'Жазылмаған')+'</span></summary><label>Қандай құбылыс байқадыңыз? Оны қалай түсіндіресіз?<textarea data-note="'+i+'" maxlength="500" '+(i>=s.index?'disabled':'')+' placeholder="'+(i>=s.index?'Бұл қадамды орындағаннан кейін ашылады.':'Өз бақылауыңызды жазыңыз: түсі, көпіршік, тұнба, температура немесе басқа өзгеріс.')+'">'+esc(s.notes[i])+'</textarea></label></details>').join('')+'<label class="cg-conclusion-label">Жұмыстың қорытындысы<textarea data-conclusion maxlength="1500" placeholder="Мақсатқа жеттіңіз бе? Қандай бақылау қорытындыңызды дәлелдейді?">'+esc(s.conclusion)+'</textarea></label><div class="cg-save-row"><button data-save>Бақылауларды сақтау</button><button class="cg-primary" data-finish '+(s.finished?'disabled':'')+'>'+(s.finished?'Есеп аяқталды ✓':'Есепті аяқтау')+'</button></div><p class="cg-save-status" data-save-status role="status">'+esc(storageStatus)+'</p><p class="cg-small">Бақылаулар аккаунтыңызға сақталады. Есепті өз нәтижелеріңізден қайта ашуға болады; әкімші есепті көре алады. Жасыл белгі ғылыми жауаптың дұрыстығын бағаламайды.</p>'+(s.previous?'<details class="cg-previous"><summary>Алдыңғы талпыныстың сақталған есебі</summary><p>Уақыт: '+clock(s.previous.elapsedMs)+'</p>'+s.previous.notes.map((n,i)=>n?'<p><b>'+esc(l.steps[i]?.label||'Бақылау')+'</b><br>'+esc(n)+'</p>':'').join('')+'<p>'+esc(s.previous.conclusion)+'</p></details>':'')+'</section>';}
function render(){
 const l=lab(),s=state();root.innerHTML='<header class="cg-header"><strong>ChemBridge <span>/ Виртуалды практикум</span></strong><span class="cg-demo">'+grade+'-сынып · зертханалық журнал</span></header><div class="cg-top"><label>Зертханалық жұмыс<select data-lab>'+LABS.map(x=>'<option value="'+x.id+'" '+(x.id===active?'selected':'')+'>'+esc(x.no+' · '+x.title)+'</option>').join('')+'</select></label><div class="cg-timer"><span>Жұмыс уақыты</span><output data-clock aria-live="off">'+clock(elapsed(s))+'</output><button data-pause '+(s.finished?'disabled':'')+'>'+(s.runningSince===null?'Жалғастыру':'Кідірту')+'</button></div></div><section class="cg-title"><span>'+l.no+' · '+(l.source||('оқулықтың '+l.pages+'-беті'))</span><h1>'+esc(l.title)+'</h1><p><b>Мақсаты:</b> '+esc(l.goal)+'</p></section><div class="cg-layout"><aside class="cg-tools"><h2>Құралдар мен реактивтер</h2><p>Үстелге қосу үшін «+» басыңыз немесе сүйреп апарыңыз.</p><div class="cg-tool-list">'+l.tools.map((t,i)=>'<button data-tool="'+i+'" draggable="true" aria-label="'+esc(t)+' үстелге қосу" '+(s.tools.includes(t)||task?'disabled':'')+'><span class="cg-tool-art" aria-hidden="true">'+(i%3===0?'▥':i%3===1?'◒':'▱')+'</span><span>'+esc(t)+'</span><b>'+(s.tools.includes(t)?'✓':'+')+'</b></button>').join('')+'</div><section class="cg-safety"><h3>Қауіпсіздік</h3><p>Барлық әрекет тек экранда орындалады. Реактивтердің дәмін татуға және ыдыстан тікелей иіскеуге болмайды.</p><p>'+esc(l.extra||'Нақты жұмысты тек мұғалімнің нұсқауымен орындаңыз. Құралдың бүтіндігін және орнықтылығын тексеріңіз.')+'</p></section></aside><section class="cg-bench" aria-label="Тәжірибе үстелі"><div class="cg-bench-top"><span>'+s.tools.length+'/'+l.tools.length+' құрал орналасты</span><button data-reset '+(task?'disabled':'')+'>'+(resetArmed?'Иә, жаңа талпыныс':'Қайта бастау')+'</button></div><div data-drop class="cg-drop">'+scene(l,s)+'</div><div class="cg-installed">'+s.tools.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="cg-action"><strong>'+(s.index<l.steps.length?'Келесі әрекет':'Барлық әрекет орындалды')+'</strong><p>'+esc(l.steps[s.index]?.label||'Бақылаулар мен қорытындыны толықтырып, есепті аяқтаңыз.')+'</p><button class="cg-primary" data-perform '+(task||s.index>=l.steps.length||s.finished?'disabled':'')+'>'+(task?'Орындалуда…':'Осы әрекетті орындау')+'</button><progress data-action-progress max="100" value="0" '+(!task?'hidden':'')+'></progress><p class="cg-feedback" role="status">'+esc(flash)+'</p></div></section><aside class="cg-procedure"><h2>Жұмыстың орындалу реті</h2><p>'+s.index+' / '+l.steps.length+' қадам орындалды</p><ol>'+l.steps.map((st,i)=>'<li class="'+(i<s.index?'complete':i===s.index?'current':'waiting')+'"><button data-step="'+i+'" aria-label="'+(i+1)+'. '+esc(st.label)+'"><span class="cg-step-dot">'+(i<s.index?'✓':i+1)+'</span><span>'+esc(st.label)+'<small>'+(i<s.index?'Орындалды':i===s.index?'Қазір орындалады':'Кезегін күтеді')+'</small></span></button></li>').join('')+'</ol><p class="cg-legend"><span>✓</span> Жасыл белгі — тәжірибе қадамы орындалды. Жазбаның сақталуы төменде бөлек көрсетіледі.</p></aside></div>'+notebook(l,s)+'<footer class="cg-source">'+esc(host.source||'М.Қ. Оспанова, Қ.С. Аухадиева, Т.Г. Белоусова. «Химия», 7-сынып. Мектеп, 2025. Көріністер мен сценарийлер — платформалық бейімдеу. Модельдегі құбылыстар көрсетіледі; нақты лабораториялық өлшеу дәлдігі берілмейді.')+'</footer>';
 bind();
}
function addTool(index){const l=lab(),s=state(),t=l.tools[index];if(!t||s.tools.includes(t)||task)return;s.tools.push(t);start(s);flash=t+' үстелге қосылды.';mark();render();}
function perform(){
 const l=lab(),s=state();if(task||s.index>=l.steps.length||s.finished)return;
 if(l.tools.some(t=>!s.tools.includes(t))){flash='Алдымен барлық қажетті құрал мен реактивті үстелге орналастырыңыз.';render();return;}
 start(s);task={id:active,index:s.index,at:elapsed(s),duration:l.steps[s.index].seconds*1000};flash='Әрекет аяқталғанша құбылысты бақылаңыз.';render();
}
function finish(){const l=lab(),s=state();if(task||s.index!==l.steps.length){flash='Алдымен барлық тәжірибе қадамын орындаңыз.';render();return;}const empty=s.notes.findIndex(n=>n.trim().length<15);if(empty>=0){selectedNote=empty;flash=(empty+1)+'-қадамға өз бақылауыңызды кемінде 15 таңбамен жазыңыз.';render();return;}if(s.conclusion.trim().length<20){flash='Қорытындыны кемінде 20 таңбамен жазыңыз.';render();return;}pause(s);s.finished=true;flash='Есеп аяқталды. Бақылау мәтіндеріне автоматты дұрыс/қате бағасы қойылмайды.';mark();render();save(true);}
function bind(){
 $('[data-lab]').onchange=async e=>{const chosen=e.target.value;pause(state());task=null;mark();await save(true);if(dirty&&!host.admin){e.target.value=active;flash='Алдымен осы зертхананың бақылауын сақтаңыз.';render();return;}active=chosen;selectedNote=0;resetArmed=false;flash='';storageStatus=host.initial?.[active]?'Аккаунттағы есеп қалпына келтірілді.':'Өз бақылауыңызды жазып, сақтаңыз.';render();};
 root.querySelectorAll('[data-tool]').forEach(b=>{b.onclick=()=>addTool(Number(b.dataset.tool));b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.tool);};});
 const drop=$('[data-drop]');drop.ondragover=e=>e.preventDefault();drop.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');if(/^\d+$/.test(raw))addTool(Number(raw));};
 $('[data-perform]').onclick=perform;
 $('[data-pause]').onclick=()=>{const s=state();if(s.finished)return;if(s.runningSince===null)start(s);else pause(s);mark();render();};
 $('[data-reset]').onclick=async()=>{const l=lab(),s=state();if(!resetArmed){resetArmed=true;flash='Алдыңғы талпыныстың мәтіні сақталады. Жаңа жұмыс бастау үшін қайта басыңыз.';render();return;}pause(s);mark();await save(true);if(dirty&&!host.admin){flash='Алдыңғы есеп сақталмады. Қайта сақтаңыз.';render();return;}const prior=copy(s);delete prior.previous;records[active]={...fresh(l),attempt:s.attempt+1,previous:prior};task=null;resetArmed=false;selectedNote=0;flash='Жаңа талпыныс дайын. Алдыңғы есеп төменде сақталған.';mark();render();save(true);};
 root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.step);if(i<state().index){selectedNote=i;flash=(i+1)+'-қадамның бақылауын төменде жаза аласыз.';render();}else if(i===state().index)perform();else{flash='Қадамдар ретімен орындалады. Алдымен '+(state().index+1)+'-қадамды аяқтаңыз.';render();}});
 root.querySelectorAll('[data-note]').forEach(t=>t.oninput=()=>{state().notes[Number(t.dataset.note)]=t.value;state().finished=false;const finishButton=$('[data-finish]');if(finishButton){finishButton.disabled=false;finishButton.textContent='Есепті аяқтау';}mark();});
 $('[data-conclusion]').oninput=e=>{state().conclusion=e.target.value;state().finished=false;const finishButton=$('[data-finish]');if(finishButton){finishButton.disabled=false;finishButton.textContent='Есепті аяқтау';}mark();};
 $('[data-save]').onclick=()=>save(true);$('[data-finish]').onclick=finish;
}
let autoAt=Date.now();
const interval=setInterval(()=>{
 const s=state(),now=Date.now();const c=$('[data-clock]');if(c)c.textContent=clock(elapsed(s,now));
 if(task&&task.id===active){const progress=Math.min(100,(elapsed(s,now)-task.at)/task.duration*100);const bar=$('[data-action-progress]');if(bar)bar.value=progress;
 if(progress>=100){records[active]=completeStep(lab(),s,task.index);selectedNote=task.index;task=null;flash='Қадам орындалды ✓ Енді байқалған құбылысты өз сөзіңізбен жазыңыз.';mark();render();save(false);}}
 if(now-autoAt>5000&&s.runningSince!==null&&!task){autoAt=now;save(false);}
},250);
const onHide=()=>{pause(state());if(dirty)save(false);};window.addEventListener('pagehide',onHide);
render();
return ()=>{pause(state());if(dirty)save(false);disposed=true;clearInterval(interval);clearTimeout(saveTimer);window.removeEventListener('pagehide',onHide);};
}
