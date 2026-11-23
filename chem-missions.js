import {SupabaseStore} from './store.js';
const M={"7":{"name":"Заттар сұрыптаушысы","desc":"Күнделікті заттарды үш топқа орналастыр.","labels":["Жай зат","Күрделі зат","Қоспа"],"easy":[["Оттек · O₂",0,"O₂ молекуласында бір ғана элементтің атомдары бар."],["Ас тұзы · NaCl",1,"NaCl құрамында натрий мен хлор бар."],["Ауа",2,"Ауа — бірнеше газдың қоспасы."]],"hard":[["Тазартылған суда еріген ас тұзы",2,"Су мен тұз бірге біртекті қоспа түзеді."],["Таза озон · O₃",0,"Үш атом болғанымен, бәрі оттек атомдары."],["Таза көмірқышқыл газы · CO₂",1,"Көміртек пен оттек бір қосылыс түзеді."]]},"8":{"name":"Теңдеу құрастыр","desc":"Атомдар саны екі жақта тең болсын. Ең кіші бүтін коэффициенттерді енгіз.","easy":[["H₂ + O₂ → H₂O",[2,1,2]],["Na + Cl₂ → NaCl",[2,1,2]],["Mg + O₂ → MgO",[2,1,2]]],"hard":[["Fe + O₂ → Fe₂O₃",[4,3,2]],["Al + O₂ → Al₂O₃",[4,3,2]],["C₃H₈ + O₂ → CO₂ + H₂O",[1,5,3,4]]]},"9":{"name":"Ион детективі","desc":"Дерек бойынша тұнбаны немесе бақылаушы ионды тап.","easy":[["Ag⁺ пен Cl⁻ бір ерітіндіде кездескенде қандай тұнба түзіледі?",["AgCl","NaCl","KNO₃"],0,"Ag⁺ + Cl⁻ → AgCl↓."],["Ba²⁺ + SO₄²⁻ → ?",["BaCl₂","BaSO₄","Na₂SO₄"],1,"Барий сульфаты нашар ериді."],["H⁺ пен OH⁻ қосылғанда не түзіледі?",["H₂","O₂","H₂O"],2,"Бейтараптануда су түзіледі."]],"hard":[["NaCl + AgNO₃ → AgCl↓ + NaNO₃. Қысқартылған теңдеуге кірмейтін иондар?",["Ag⁺ пен Cl⁻","Na⁺ пен NO₃⁻","Na⁺ пен Cl⁻"],1,"Na⁺ және NO₃⁻ екі жақта да өзгеріссіз қалады."],["Қай жағдайдағы нәтиже ион алмасуды көрсетеді?",["Екі еритін нитратты араластырғанда өзгеріс жоқ","Екі ерітінді де бастапқыда мөлдір","Араластырудан кейін ерімейтін тұнба түзіледі"],2,"Тұнба иондардың ерітіндіден бөлініп шыққанын көрсетеді."],["Қай қысқартылған теңдеу атом саны мен зарядты сақтайды?",["CO₃²⁻ + 2H⁺ → CO₂ + H₂O","CO₃²⁻ + H⁺ → CO₂ + H₂O","CO₃²⁻ + 3H⁺ → CO₂ + H₂O"],0,"Сол жағындағы −2 және +2 зарядтары теңеседі; атом саны да сақталады."]]},"10":{"name":"Орбиталь шеберханасы","desc":"Электрондарды ұяшықтарға орналастыр. Бос торды басқанда ↑, кейін ↑↓ шығады.","easy":[["B",5,1],["C",6,2],["O",8,4]],"hard":[["N",7,3],["F",9,5],["Ne",10,6]]},"11":{"name":"Титрлеу станциясы","desc":"Стехиометриялық қатынасты қолданып, эквиваленттік көлемді есепте. Көлемді мл-мен жаз.","easy":[["20,0 мл 0,10 М HCl ерітіндісі 0,10 М NaOH-пен титрленді. NaOH көлемі?",20,"HCl мен NaOH қатынасы 1:1. Концентрациялар тең болғандықтан, көлемдері де тең."],["25,0 мл 0,20 М HCl үшін 0,10 М NaOH көлемі?",50,"c₁V₁ = c₂V₂: 25,0 × 0,20 / 0,10 = 50 мл."],["10,0 мл 0,15 М NaOH үшін 0,15 М HCl көлемі?",10,"1:1 қатынаста концентрациялар тең болса, V₁ = V₂."]],"hard":[["20,0 мл 0,10 М H₂SO₄-ті толық бейтараптандыруға қажет 0,10 М NaOH көлемі?",40,"1 моль H₂SO₄ толық бейтараптанғанда 2 моль NaOH жұмсалады."],["15,0 мл 0,20 М Ba(OH)₂ үшін қажет 0,10 М HCl көлемі?",60,"1 моль Ba(OH)₂-ге 2 моль HCl қажет. 15,0 × 0,20 × 2 / 0,10 = 60 мл."],["10,0 мл 0,15 М H₂SO₄ үшін 0,25 М NaOH көлемі?",12,"V = 2 × 10,0 × 0,15 / 0,25 = 12 мл."]]}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let animation;
function salute(){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 clearTimeout(animation);
 $('salute').innerHTML=Array.from({length:30},(_,i)=>{const a=i*2.39996,r=75+(i%7)*16;return '<b style="--x:'+Math.round(r*Math.cos(a))+'px;--y:'+Math.round(r*Math.sin(a))+'px;--spark:'+['#ffbf30','#2bcfad','#f56a9d','#a47aff','#4abef1'][i%5]+'"></b>';}).join('');
 animation=setTimeout(()=>{$('salute').replaceChildren();},900);
}
const PARTICLES={
 name:'Атом конструкторы',desc:'Протон, нейтрон және электрон санын тап.',
 easy:[['¹²₆C · көміртек атомы',6,12,0],['²³₁₁Na · натрий атомы',11,23,0],['³⁵₁₇Cl · хлор атомы',17,35,0],['³⁷₁₇Cl · хлор изотопы',17,37,0],['²⁷₁₃Al · алюминий атомы',13,27,0]],
 hard:[['²³₁₁Na⁺ · натрий ионы',11,23,1],['³⁵₁₇Cl⁻ · хлорид ионы',17,35,-1],['²⁷₁₃Al³⁺ · алюминий ионы',13,27,3],['¹⁶₈O²⁻ · оксид ионы',8,16,-2],['⁵⁶₂₆Fe³⁺ · темір(III) ионы',26,56,3]]
};
const BALANCE={
 ...M[8],
 easy:[...M[8].easy,['Ca + O₂ → CaO',[2,1,2]],['H₂ + Cl₂ → HCl',[1,1,2]]],
 hard:[...M[8].hard,['Al + HCl → AlCl₃ + H₂',[2,6,2,3]],['Na₂CO₃ + HCl → NaCl + H₂O + CO₂',[1,2,2,1,1]]]
};
const subs='₀₁₂₃₄₅₆₇₈₉';
function balanceRows(equation,coeffs){
 const parts=equation.split('→').map(side=>side.split('+').map(x=>x.trim()));
 let i=0;
 const sums=parts.map(side=>{
  const counts=new Map();
  for(const compound of side){
   const k=coeffs[i++];
   for(const [,element,sub] of compound.matchAll(/([A-Z][a-z]?)([₀-₉]*)/g)){
    const n=Number([...sub].map(d=>subs.indexOf(d)).join('')||1);
    counts.set(element,(counts.get(element)||0)+k*n);
   }
  }
  return counts;
 });
 return [...new Set(sums.flatMap(s=>[...s.keys()]))].map(e=>[e,sums[0].get(e)||0,sums[1].get(e)||0]);
}
const inputRow=(label,extra='')=>'<label>'+esc(label)+'<input type="text" class="answer" inputmode="numeric" maxlength="2" autocomplete="off" '+extra+'></label>';
const whole=el=>/^\d+$/.test(el.value.trim())?Number(el.value):NaN;

let grade,level,turn=0,solved=0;
const flags=['□','↑','↑↓'];
function setup(){grade=Number($('mission-grade').value);level=$('mission-level').value;turn=solved=0;$('motivation').textContent='';show();}
function show(){
 const mode=$('mission-kind').value,atomic=mode==='particles',balanced=mode==='balance'||(mode==='grade'&&grade===8),type=mode==='grade'?grade:0;
 const game=atomic?PARTICLES:mode==='balance'?BALANCE:M[grade],task=game[level][turn],panel=$('mission');
 if(!task){panel.innerHTML='<div class="mission-card"><h3>Миссия аяқталды</h3><p>'+solved+' / '+game[level].length+' тапсырма орындалды.</p><button id="restart-mission" type="button">Қайта ойнау</button></div>';$('restart-mission').onclick=setup;$('restart-mission').focus();return;}
 const [prompt,a,b,why]=task;let markup='',evaluate;
 const choiceButtons=choices=>'<div class="rail">'+choices.map((label,i)=>'<button type="button" data-choice="'+i+'">'+esc(label)+'</button>').join('')+'</div>';
 if(type===7||type===9)markup=choiceButtons(type===7?game.labels:a);
 if(balanced){
  const [left,right]=prompt.split('→').map(side=>side.split('+').map(x=>x.trim()));
  markup='<p>Формулалар өзгермейді. Әр заттың алдындағы коэффициентті енгіз; 1-ді де жаз.</p><div class="equation-work"><div class="rail coeff">'+left.map(x=>inputRow(x)).join('')+'</div><span aria-hidden="true">→</span><div class="rail coeff">'+right.map(x=>inputRow(x)).join('')+'</div></div><div class="actions"><button class="primary" type="submit">Тексеру</button></div><div id="atom-counts"></div>';
  evaluate=()=>{
   const v=[...panel.querySelectorAll('.answer')].map(whole);
   if(v.some(n=>!Number.isInteger(n)||n<1)){$('atom-counts').replaceChildren();return [false,'Әр бос ұяшыққа 1 немесе одан үлкен бүтін сан жаз.'];}
   const rows=balanceRows(prompt,v),unequal=rows.filter(([,l,r])=>l!==r);
   $('atom-counts').innerHTML='<table class="scoreboard"><caption>Сенің коэффициенттерің бойынша атом саны</caption><thead><tr><th scope="col">Элемент</th><th scope="col">Сол жақ</th><th scope="col">Оң жақ</th></tr></thead><tbody>'+rows.map(([e,l,r])=>'<tr class="'+(l===r?'good':'miss')+'"><th scope="row">'+e+'</th><td>'+l+'</td><td>'+r+'</td></tr>').join('')+'</tbody></table>';
   if(unequal.length)return [false,'Тең емес элементтер: '+unequal.map(([e])=>e).join(', ')+'. Кестеге қарап коэффициенттерді өзгерт.'];
   return v.every((n,i)=>n===a[i])?[true,'Ең кіші бүтін коэффициенттер: '+a.join(' : ')+'.']:[false,'Атом сандары тең. Енді коэффициенттерді ортақ бөлгішіне бөліп, ең кіші бүтін сандарды тап.'];
  };
 }
 if(atomic){
  const [z,mass,charge]=[a,b,why],correct=[z,mass-z,z-charge],names=['Протон','Нейтрон','Электрон'];
  const chargeLabel=charge===0?'0':charge>0?'+'+charge:'−'+Math.abs(charge);
  markup='<p class="atom-facts">Z = '+z+' · A = '+mass+' · q = '+chargeLabel+'</p>'
   +(level==='easy'?'<p>Бейтарап атомда: p = Z, n = A − Z, e = Z.</p>':'<p>Ионның таңбалы зарядын ескер. Оң ион электрон жоғалтады, теріс ион электрон қосып алады.</p>')
   +'<div class="rail particles">'+names.map(n=>inputRow(n)).join('')+'</div><div class="actions"><button class="primary" type="submit">Тексеру</button></div>';
  evaluate=()=>{
   const checks=[...panel.querySelectorAll('.answer')].map((el,i)=>{
    const ok=whole(el)===correct[i];
    el.setAttribute('aria-invalid',String(!ok));el.dataset.state=ok?'ok':'bad';return ok;
   });
   if(checks.every(Boolean))return [true,'p = '+z+'; n = '+mass+' − '+z+' = '+correct[1]+'; e = '+correct[2]+'.'];
   const hints=['p = Z','n = A − Z',level==='easy'?'e = Z':'e = Z − q (q таңбасымен)'];
   return [false,'Қайта қара: '+hints.filter((_,i)=>!checks[i]).join('; ')+'.'];
  };
 }
 if(type===10){
  const shell=level==='hard'?['1s','2s','2pₓ','2pᵧ','2p_z']:['2pₓ','2pᵧ','2p_z'];
  markup=(level==='easy'?'<p>1s² және 2s² толтырылған. 2p ұяшықтарын ретте.</p>':'<p>1s, 2s және 2p ұяшықтарын түгел толтыр.</p>')+'<div class="orbitals">'+shell.map((s,i)=>'<label>'+s+'<br><button type="button" data-orbit="'+i+'" data-fill="0" aria-label="'+s+': бос">□</button></label>').join('')+'</div><button class="primary" type="submit">Тексеру</button>';
  evaluate=()=>{const v=[...panel.querySelectorAll('[data-orbit]')].map(x=>Number(x.dataset.fill)),p=v.slice(-3);return [(level==='easy'||(v[0]===2&&v[1]===2))&&p.reduce((s,n)=>s+n,0)===b&&(!p.includes(2)||!p.includes(0)),'2p-де '+b+' электрон болуы керек: алдымен бос ұяшықтарға бір-бірден, содан кейін жұппен орналастыр.'];};
 }
 if(type===11){
  markup='<label>NaOH немесе HCl көлемі, мл<input type="text" class="answer" inputmode="decimal" autocomplete="off"></label><button class="primary" type="submit">Тексеру</button>';
  evaluate=()=>{const v=panel.querySelector('.answer').value.trim().replace(',','.');return [/^\d+(\.\d+)?$/.test(v)&&Math.abs(Number(v)-a)<.051,b+' Дұрыс көлем: '+a+' мл.'];};
 }
 panel.innerHTML='<div class="mission-card"><p class="eyebrow">'+(atomic?'Атом құрылысы':mode==='balance'?'Теңдеулер':grade+'-сынып')+' · '+(turn+1)+' / '+game[level].length+'</p><h3>'+esc(game.name)+'</h3><p>'+esc(game.desc)+'</p><p><strong>'+esc(type===10?prompt+' · Z = '+a:prompt)+'</strong></p><form id="mission-form"><fieldset id="mission-fields">'+markup+'</fieldset></form><p id="mission-explanation"></p><button id="mission-next" type="button" hidden>Келесі тапсырма</button></div>';
 let complete=false;
 function feedback(ok,explanation){if(complete)return;
  $('motivation').textContent=ok?'Жарайсың! +100 ұпай':'Тағы бір рет байқап көр!';
  $('motivation').className=ok?'good':'miss';
  $('mission-explanation').textContent=ok||balanced||atomic?explanation:(type===10?'Ұяшықтардың толу ретін және электрон санын тексер.':'Жауабыңды қайта қара. Қаласаң, келесі тапсырмаға өт.');
  if(ok){complete=true;solved++;$('mission-fields').disabled=true;salute();}
  $('mission-next').hidden=false;
 }
 $('mission-next').onclick=()=>{turn++;$('motivation').textContent='';show();panel.querySelector('button,input')?.focus();};
 $('mission-form').onsubmit=e=>{e.preventDefault();if(evaluate)feedback(...evaluate());};
 for(const btn of panel.querySelectorAll('[data-choice]'))btn.onclick=()=>{const index=Number(btn.dataset.choice);feedback(index===(type===7?a:b),type===7?b:why);};
 for(const btn of panel.querySelectorAll('[data-orbit]'))btn.onclick=()=>{const n=(Number(btn.dataset.fill)+1)%3;btn.dataset.fill=String(n);btn.textContent=flags[n];btn.setAttribute('aria-label',btn.parentElement.firstChild.textContent+': '+['бос','бір электрон','екі электрон'][n]);};
}
$('mission-grade').onchange=$('mission-level').onchange=setup;
$('mission-kind').onchange=()=>{
 $('mission-grade').disabled=$('mission-kind').value!=='grade';
 setup();
};
const params=new URLSearchParams(location.search),requested=params.get('grade');
if(M[requested])$('mission-grade').value=requested;
if(params.get('difficulty')==='hard')$('mission-level').value='hard';
if(['balance','particles'].includes(params.get('mission')))$('mission-kind').value=params.get('mission');
$('mission-kind').onchange();
const cfg=window.__CHEM_CONFIG__,db=cfg?.supabaseUrl&&cfg?.supabaseAnonKey?new SupabaseStore(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
const roomStatus=msg=>{$('live-status').textContent=msg;};
const errorText=e=>{
 const map={game_teacher_only:'Бөлмені мұғалім немесе әкімші аккаунты ашады.',game_join_closed:'Бөлме табылмады немесе айналым басталып кеткен.',game_full:'Бөлме толды.',game_nickname_taken:'Бұл лақап ат алынған. Басқасын таңда.',game_nickname:'Лақап атқа 2–18 әріп, цифр, сызықша немесе астын сызу белгісін қолдан.',game_room_missing:'Бөлме жабылған. Мұғалімнен жаңа код сұра.',game_round_closed:'Уақыт аяқталды.',game_limit:'Қазір ашық бөлмелер саны шекке жетті.',game_login:'Алдымен мұғалім аккаунтына кіріңіз.'};
 return Object.entries(map).find(([k])=>e.message?.includes(k))?.[1]||'Бөлмеге қосылу мүмкін болмады. Байланысты тексеріп, қайта көріңіз.';
};
async function rpc(name,args,host=false){
 if(!db)throw Error('game_unavailable');
 const sess=host?await db.validSession():null;
 if(host&&!sess?.access_token)throw Error('game_login');
 return db.request('/rest/v1/rpc/cb_game_'+name,{method:'POST',headers:db.headers(sess?.access_token),body:JSON.stringify(args)});
}
let room=null,polling=false,roundView='',roomList='',shownScore=false,delay,remaining=0,measured=0,requesting=false;
function tab(live){$('solo').hidden=live;$('live').hidden=!live;$('solo-tab').setAttribute('aria-pressed',String(!live));$('live-tab').setAttribute('aria-pressed',String(live));if(live&&room)sync();}
$('solo-tab').onclick=()=>tab(false);$('live-tab').onclick=()=>tab(true);
function roomPanel(){
 const r=room;const link=new URL('chem-missions.html',location.href);link.searchParams.set('room',r.code);
 $('live-setup').hidden=true;
 $('live-room').innerHTML='<div class="mission-card"><h3>Бөлме <strong class="room-code">'+esc(r.code)+'</strong></h3>'+(r.host?'<p>Оқушыларға мына сілтемені немесе кодты беріңіз.</p><a id="join-link" href="'+esc(link.href)+'">'+esc(link.href)+'</a><div class="actions"><button id="start-live" class="primary" type="button">Жарысты бастау</button></div><div id="board"></div>':'<p>Лақап атың: <b>'+esc(r.nick)+'</b></p>')+'<button type="button" id="leave">Бөлмеден шығу</button></div>';
 $('leave').onclick=()=>{room=null;clearTimeout(delay);sessionStorage.removeItem('cb-mission-room');$('live-room').replaceChildren();$('live-tasks').replaceChildren();$('live-clock').hidden=true;$('live-setup').hidden=false;roomStatus('');};
 if(r.host)$('start-live').onclick=async()=>{try{const ok=await rpc('start',{p_code:r.code},true);if(!ok)roomStatus('Жарысты бастау үшін кемінде бір оқушы қосылуы керек.');else sync();}catch(e){roomStatus(errorText(e));}};
}
function enter(r){room=r;roundView=roomList='';shownScore=false;sessionStorage.setItem('cb-mission-room',JSON.stringify(r));roomPanel();sync();}
function board(s){
 const markup='<h4>Ұпай тақтасы · '+s.board.length+' қатысушы</h4>'+(s.board.length?'<table class="scoreboard"><thead><tr><th scope="col">Лақап ат</th><th scope="col">Ұпай</th></tr></thead><tbody>'+s.board.map(p=>'<tr><td>'+esc(p.nick)+'</td><td>'+(Number.isFinite(p.score)?p.score:'—')+'</td></tr>').join('')+'</tbody></table>':'<p>Оқушыларды күтіп тұрмыз.</p>');
 if(markup!==roomList){$('board').innerHTML=markup;roomList=markup;}
 $('start-live').hidden=s.phase!=='waiting';$('start-live').disabled=!s.board.length;
}
function quiz(s){
 const state=s.phase+':'+s.score;if(state===roundView)return;roundView=state;
 const el=$('live-tasks'),r=room;
 if(s.phase==='finished'){
  el.innerHTML='<h3>'+(s.score===null?'Жауап тапсырылмады':'Нәтиже: '+s.score+' / '+(s.total*100)+' ұпай')+'</h3>'+s.review.map(q=>'<div class="task"><strong>'+esc(q.prompt)+'</strong><p>'+esc(q.choices[q.correct])+' · '+esc(q.why)+'</p></div>').join('');return;
 }
 if(s.score!==null){el.innerHTML='<h3>Жауабың қабылданды · '+s.score+' / '+(s.total*100)+' ұпай</h3><p>Айналым біткенде дұрыс жауаптар шығады.</p>';if(!shownScore&&s.score===s.total*100){salute();el.insertAdjacentHTML('afterbegin','<p class="good">Жарайсың!</p>');}shownScore=true;return;}
 if(s.phase!=='playing'){el.replaceChildren();return;}
 el.innerHTML='<form class="live-quiz" id="live-quiz">'+s.questions.map((q,n)=>'<fieldset><legend>'+(n+1)+'. '+esc(q.prompt)+'</legend>'+q.choices.map((x,i)=>'<label><input type="radio" value="'+i+'" name="q'+n+'" required>'+esc(x)+'</label>').join('')+'</fieldset>').join('')+'<button class="primary">Жауаптарды тапсыру</button></form>';
 $('live-quiz').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,fd=new FormData(form),b=form.querySelector('button');b.disabled=true;
  try{const score=await rpc('submit',{p_code:r.code,p_ticket:r.ticket,p_answers:s.questions.map((_,i)=>Number(fd.get('q'+i)))});if(room===r){quiz({...s,score});sync();}}
  catch(e){if(room===r){roomStatus(errorText(e));b.disabled=false;}}
 };
}
async function sync(){
 clearTimeout(delay);
 if(polling||!room||$('live').hidden)return;polling=true;const r=room;
 try{const s=await rpc('state',{p_code:r.code,p_ticket:r.ticket||null},r.host);if(room!==r)return;
  $('live-clock').hidden=s.phase==='waiting';remaining=s.seconds;measured=performance.now();paint();
  roomStatus(({waiting:'Мұғалім жарысты бастағанша күте тұрыңыз.',playing:'Жарыс жүріп жатыр.',finished:'Уақыт аяқталды.'})[s.phase]);
  if(r.host)board(s);else quiz(s);
  if(s.phase==='finished')return;
 }catch(e){if(room===r)roomStatus(errorText(e));if(/game_room_missing|game_login/.test(e.message||''))return;}
 finally{polling=false;if(room&&room!==r)sync();}
 if(room===r)delay=setTimeout(sync,3000);
}
function paint(){if($('live-clock').hidden)return;const t=Math.max(0,remaining-Math.floor((performance.now()-measured)/1000));$('live-clock').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
setInterval(paint,300);
function submitRoom(id,handler){$(id).onsubmit=async e=>{e.preventDefault();if(requesting)return;const form=e.currentTarget,fd=new FormData(form),button=form.querySelector('button');button.disabled=true;requesting=true;roomStatus('Қосылып жатыр…');try{await handler(fd);}catch(e){roomStatus(errorText(e));}finally{button.disabled=false;requesting=false;}};}
submitRoom('join-room',async fd=>{const code=String(fd.get('code')).trim().toUpperCase(),nick=String(fd.get('nick')).trim(),ticket=await rpc('join',{p_code:code,p_nick:nick});enter({code,nick,ticket,host:false});});
submitRoom('host-room',async fd=>{const code=await rpc('create',{p_grade:Number(fd.get('grade')),p_difficulty:fd.get('difficulty'),p_seconds:Number(fd.get('seconds'))},true);enter({code,host:true});});
const joinCode=params.get('room')?.toUpperCase();
if(/^[A-F0-9]{8}$/.test(joinCode||'')){$('join-room').elements.code.value=joinCode;$('host-room').hidden=true;tab(true);}
try{const previous=JSON.parse(sessionStorage.getItem('cb-mission-room'));if(previous?.code&&(!joinCode||joinCode===previous.code)){tab(true);enter(previous);}}catch{}
