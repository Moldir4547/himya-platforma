import {SCHOOL_UNITS} from './school-curriculum.js';
import {matchesTopic} from './school-materials.js';
import {teacherEntries} from './teacher-materials.js';
export const JOURNEY_PATH='/sabaktastyk-kopiri/mugalim-zholy';
const esc=(s='')=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const TEACHING_TRACKS=[
 {id:'bond',title:'Химиялық байланыс',grade:8,schoolSlug:'bonding',terms:['байланыс','гибрид','орбиталь'],bridge:'/sabaktastyk-kopiri/himiyalyk-bailanys',question:'Су қайнағанда молекуланың ішінде не болады?',
  school:'Атомдар байланысып, молекула немесе кристалдық тор түзеді. O–H байланысы полярлы коваленттік байланысқа жатады.',
  university:'Байланысты валенттік байланыс және молекулалық орбиталь әдістерімен талдаймыз. Молекула геометриясын, полярлығын және молекулааралық әсерлерді ажыратамыз.',
  teach:'Оқушыдан «Су қайнағанда сутек пен оттек түзіле ме?» деп сұраңыз. Су молекуласының моделін өзгеріссіз қалдырып, молекулалардың арақашықтығын үлкейтіңіз.',
  evidence:'Оқушы молекула ішіндегі байланысты молекулааралық әсерден ажыратып, будың да H₂O екенін түсіндіреді.',
  options:['O–H байланыстары үзіліп, H₂ мен O₂ түзіледі.','Молекулалар алыстайды; O–H байланыстары сақталады.','Оттек атомдары сутек атомдарына айналады.'],answer:1,
  why:'Қайнау — физикалық үдеріс: молекулааралық әсерлер еңсеріледі, бірақ H₂O молекуласының құрамы мен O–H байланыстары сақталады.',
  boundary:'Мектептегі шар-өзек моделі құрылымды түсіндіреді. Ол электрондық бұлттың нақты бейнесі емес.'},
 {id:'atom',title:'Атом құрылысы',grade:7,schoolSlug:'structure-isotopes',terms:['атом құрылы','электрон','квант'],bridge:'/mektep/teoriya/10-synyp/atomic-orbitals',question:'Атом оң ионға айналғанда не өзгереді?',
  school:'Протон саны элементті анықтайды; нейтрон саны өзгерсе изотоп, электрон саны өзгерсе ион түзіледі.',
  university:'Электрон күйі квант сандары және орбитальдар арқылы сипатталады. Орбиталь — электронның нақты айналу жолы емес, ықтималдық сипаттамасы.',
  teach:'Ядро мен электрондарды бөлек белгілермен көрсетіңіз. Na атомынан бір электронды алып, ядроны өзгеріссіз қалдырыңыз. Содан кейін қабат моделі мен орбиталь моделінің қолданылу шегін салыстырыңыз.',
  evidence:'Оқушы ион түзілуін электрон санымен түсіндіреді және оның жаңа элементтің түзілуі емес екенін дәлелдейді.',
  options:['Ядродағы протон саны артады.','Атом бір немесе бірнеше электрон береді.','Барлық нейтрон электронға айналады.'],answer:1,
  why:'Оң ион электрон беру арқылы түзіледі. Протон саны сақталады, сондықтан элемент өзгермейді.',
  boundary:'Электрондық қабаттағы шеңберлерді электронның нақты траекториясы деп түсіндіруге болмайды.'},
 {id:'equivalent',title:'Мольден эквивалентке',grade:8,schoolSlug:'mole-avogadro',terms:['эквивалент','зат мөлшері','стехиометр'],bridge:'/sabaktastyk-kopiri/ekvivalent-ugymy',question:'H₂SO₄ екі протоны бойынша толық бейтараптанса, эквиваленттік молярлық массасы қандай? M = 98 г/моль.',
  school:'Зат мөлшері бөлшектерді санауға, ал реакция теңдеуінің коэффициенттері заттардың мөлшерлік қатынасын табуға көмектеседі.',
  university:'Эквиваленттік фактор нақты реакцияға тәуелді. Қышқылдың толық немесе жартылай бейтараптануына қарай z мәні өзгереді; Mэкв = M/z.',
  teach:'H₂SO₄ + NaOH → NaHSO₄ + H₂O және H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O теңдеулерін салыстырыңыз. Бір қышқыл үшін неліктен z = 1 және z = 2 болатынын студент түсіндірсін.',
  evidence:'Білім алушы эквивалентті заттың өзгермейтін қасиеті ретінде қабылдамай, реакциямен байланыстырады.',
  options:['98 г/моль','49 г/моль','196 г/моль'],answer:1,
  why:'Екі протон бойынша толық бейтараптануда z = 2. Сондықтан Mэкв = 98/2 = 49 г/моль. Бір протон ғана әрекеттессе, бұл мән басқаша болады.',
  boundary:'Эквивалентті түсіндіру алдында нақты реакция мен оның жүру дәрежесін көрсету қажет.'},
 {id:'solutions',title:'Ерітінді және концентрация',grade:8,schoolSlug:'solutions',terms:['ерітінді','концентрация','ерігіштік'],bridge:'/sabaktastyk-kopiri/eritindiler',question:'10 г NaCl мен 90 г судан алынған ерітіндідегі тұздың массалық үлесі қандай?',
  school:'Массалық үлесте еріген зат массасын ерітіндінің толық массасына бөлеміз. Еру мен ерігіштік шегін ажыратамыз.',
  university:'Массалық үлес, молярлық концентрация және ерітінді тығыздығы арасындағы байланысты қолданамыз. Сұйылтуда еріген зат мөлшерінің сақталу шартын тексереміз.',
  teach:'10 г тұз бен 90 г су моделін көрсетіңіз. «Неге 10-ды 90-ға емес, 100-ге бөлеміз?» деген сұрақ қойыңыз. Кейін көлем берілмесе, молярлық концентрацияны бірден таба алмайтынын талқылаңыз.',
  evidence:'Оқушы еріткіш пен ерітінді массасын шатастырмайды; студент молярлық концентрацияға қандай қосымша дерек қажет екенін атайды.',
  options:['11,1%','10%','90%'],answer:1,
  why:'Ерітінді массасы 10 + 90 = 100 г. w = 10/100 × 100% = 10%. Еріткіш массасын бөлімге қою дұрыс емес.',
  boundary:'Массаларды қосуға болады; сұйықтардың көлемдері әр жағдайда дәл қосыла бермейді.'},
 {id:'redox',title:'Электрон алмасу',grade:9,schoolSlug:'redox',terms:['тотығу','тотықсыздан','электрохим'],bridge:'/sabaktastyk-kopiri/totygu-totyksyzdanu',question:'Fe²⁺ → Fe³⁺ өзгерісінде темір бөлшегі не істейді?',
  school:'Тотығу дәрежесінің артуы электрон беруге, кемуі электрон қосып алуға сәйкес келеді.',
  university:'Электрондық және ион-электрондық теңестіруді, электродтық үдерістерді және ортаның реакцияға әсерін талдаймыз.',
  teach:'Fe²⁺ бөлшегінен бір электронның кетуін модельде көрсетіңіз. «Заряд неге артады, егер бөлшек бір нәрсе жоғалтса?» деген сұрақ арқылы электрон зарядына назар аудартыңыз.',
  evidence:'Білім алушы Fe²⁺ → Fe³⁺ + e⁻ теңдеуін жазып, оны тотығу деп негіздейді.',
  options:['Бір электрон қосып алады.','Бір электрон береді.','Ядросына бір протон қосады.'],answer:1,
  why:'Fe²⁺ → Fe³⁺ + e⁻: теріс зарядты электрон берілгендіктен, ионның оң заряды бір бірлікке артады. Бұл — тотығу.',
  boundary:'Тотығу дәрежесін атомның барлық қосылыстағы нақты электр зарядымен теңестіруге болмайды.'}
];
const SCHOOL_PATH=t=>'/mektep/teoriya/'+t.grade+'-synyp/'+t.schoolSlug;
const STAGES=[['school','Мектеп','Тірек білім'],['university','ЖОО','Терең түсіну'],['teach','Практика','Оқушыға түсіндіру']];
function molecule(){
 return '<svg class="tj-molecule" viewBox="0 0 320 250" role="img" aria-label="Су молекуласының шартты шар-өзек моделі: бір оттек және екі сутек атомы"><defs><radialGradient id="tj-oxygen" cx=".3" cy=".25" r=".8"><stop stop-color="#ffdfc9"/><stop offset=".5" stop-color="#e68668"/><stop offset="1" stop-color="#9d4a41"/></radialGradient><radialGradient id="tj-hydrogen" cx=".3" cy=".25" r=".8"><stop stop-color="white"/><stop offset=".6" stop-color="#d9f1ed"/><stop offset="1" stop-color="#6baca7"/></radialGradient></defs><ellipse cx="160" cy="210" rx="106" ry="15" fill="#204b48" opacity=".08"/><ellipse cx="160" cy="126" rx="127" ry="88" fill="none" stroke="#b6d7d1" stroke-dasharray="3 8"/><path d="M160 98L89 164M160 98L231 164" stroke="#7aaca5" stroke-width="15" stroke-linecap="round"/><path d="M160 94L87 160M160 94L229 160" stroke="#e9f6ee" stroke-width="4" stroke-linecap="round"/><circle cx="160" cy="98" r="46" fill="url(#tj-oxygen)"/><circle cx="89" cy="164" r="31" fill="url(#tj-hydrogen)"/><circle cx="231" cy="164" r="31" fill="url(#tj-hydrogen)"/><g font-family="system-ui,sans-serif" text-anchor="middle" font-weight="700" fill="#244742"><text x="160" y="108" font-size="28" fill="white">O</text><text x="89" y="172" font-size="23">H</text><text x="231" y="172" font-size="23">H</text></g><text x="160" y="242" text-anchor="middle" font-size="13" fill="#496a64">H₂O · шартты оқу моделі</text></svg>';
}
export function teacherHome(state,continueHtml=''){
 return '<div class="tj-home"><section class="learn-home chembridge-home tj-hero"><div class="tj-hero-copy"><span class="tj-eyebrow">ХИМИЯ МҰҒАЛІМІНЕ АРНАЛҒАН ОҚУ ОРТАСЫ</span><h1>Химияны терең түсініңіз.<br><em>Оқушыға түсінікті жеткізіңіз.</em></h1><p>Мектептен басталған білім ЖОО-да қалай күрделенеді? ChemBridge осы байланысты түсініп, оны өз сабағыңызда қолдануға көмектеседі.</p><div class="tj-actions"><a class="tj-primary" href="'+JOURNEY_PATH+'">Мұғалім жолын ашу <span aria-hidden="true">↗</span></a><a class="tj-text-link" href="/topics">Оқуды бастау →</a></div><div class="tj-audience"><span>Болашақ мұғалім</span><span>Практикант</span><span>Химияны тереңдетіп оқитын білім алушы</span></div></div><aside class="tj-hero-visual" aria-label="Мектептен сабақ беруге дейін"><div class="tj-visual-label"><span>БІР ТАҚЫРЫП</span><b>Үш қырынан түсіну</b></div>'+molecule()+'<div class="tj-mini-path"><span><b>01</b> Мектептегі негіз</span><span><b>02</b> ЖОО-дағы тереңдік</span><span><b>03</b> Өз сабағыңыз</span></div></aside></section>'+continueHtml+
 '<section class="tj-home-story"><div><span class="tj-eyebrow">БІЛІМНЕН — ТҮСІНДІРУГЕ</span><h2>Тек жауабын білу жеткіліксіз.<br>Оның себебін түсіндіре алу маңызды.</h2></div><p>Мысалы, оқушы «су қайнағанда молекула ыдырай ма?» деп сұрайды. Сіз молекулааралық әсер мен молекула ішіндегі байланысты ажыратып, жасына сай модельмен дәлелдейсіз.</p><a class="tj-story-link" href="'+JOURNEY_PATH+'?topic=bond">Осы мысалмен жұмыс істеу →</a></section>'+
 '<section class="home-directions tj-directions" aria-labelledby="directions-title"><header><span class="tj-eyebrow">ҮШ БӨЛІМ — БІР ОҚУ ЖОЛЫ</span><h2 id="directions-title">Өзіңізге қажет бөлімді таңдаңыз</h2></header><div class="direction-cards">'+[
 ['school','01','Мектеп','Оқушының бастапқы түсінігін таныңыз. 7–11-сынып теориясын, сызбалар мен тапсырмаларды қараңыз.','Сыныпты таңдау','/mektep'],
 ['university','02','Университет','Таныс ұғымды тереңдетіңіз. Дәрістерді, зертханаларды және ағымдық бақылауды пайдаланыңыз.','ЖОО модулін ашу','/universitet'],
 ['bridge','03','Сабақтастық көпірі','Екі деңгейдің айырмасын түсіндіріңіз. Өтпелі тапсырмалар арқылы білімді байланыстырыңыз.','Көпірден бастау','/sabaktastyk-kopiri']
 ].map(([tone,n,title,copy,action,href])=>'<article class="direction-card '+tone+'"><span class="direction-number" aria-hidden="true">'+n+'</span><h3>'+title+'</h3><p>'+copy+'</p><a href="'+href+'">'+action+' →</a></article>').join('')+'</div></section>'+
 '<section class="tj-start orientation-panel" aria-labelledby="start-guide-title"><span class="tj-eyebrow">АЛҒАШҚЫ ҚАДАМ</span><h2 id="start-guide-title">Бір тақырыпты алып, сабаққа дейін жеткізіңіз</h2><ol class="start-guide"><li><strong>Мектептегі түсінікті еске түсіріңіз</strong><span>Оқушы нені біледі, нені шатастыруы мүмкін?</span></li><li><strong>ЖОО деңгейінде тереңдетіңіз</strong><span>Қай модель, заң немесе дәлел жаңадан қосылады?</span></li><li><strong>Оқытуға дайындаңыз</strong><span>Мысал, көрнекілік және түсінгенін тексеретін сұрақ құрыңыз.</span></li></ol><a class="tj-text-link" href="'+JOURNEY_PATH+'">Тақырыптарды салыстырып, жоспар құру →</a>'+(state.user?'':'<p class="orientation-note">Сабақтарды ашу және жеке нәтижелерді көру үшін <a href="/login">кіріңіз</a> немесе <a href="/register">тіркеліңіз</a>.</p>')+'</section>'+
 '<section class="teacher-home-entry tj-toolbox"><div><span class="tj-eyebrow">САБАҚҚА ҚАЖЕТ ҚҰРАЛДАР</span><h2>Дайын материалды орнымен қолданыңыз</h2><p>Тақырыпқа сәйкес материалды таңдаңыз, кейін оны өз түсіндіруіңізбен толықтырыңыз.</p></div><div class="tj-tool-links"><a href="/mugalim-materialdary"><b>Мұғалім материалдары ↗</b><span>Слайдтар, жұмыс парақтары, PISA</span></a><a href="/materials"><b>Оқу кітапханасы ↗</b><span>Мектеп пен ЖОО оқулықтары</span></a><a href="/kabinet"><b>Жеке нәтижелер ↗</b><span>Орындалған тапсырмалар мен прогресс</span></a></div></section></div>';
}
export function schoolContentAudit(state){
 const entries=teacherEntries(state.items||[],state.allResources||[]),byId=new Map((state.items||[]).map(i=>[i.id,i]));
 function belongs(item,grade){const seen=new Set();while(item&&!seen.has(item.id)){seen.add(item.id);if(item.path==='/mektep/teoriya/'+grade+'-synyp')return true;item=byId.get(item.parent_id);}return false;}
 return SCHOOL_UNITS.map(u=>{
  const files=entries.filter(e=>e.area==='school'&&belongs(e.item,u.grade));
  const count=kind=>files.filter(e=>matchesTopic(e.row.filename||'',u,kind,{...e.row,topicTitle:e.item.title})).length;
  return {slug:u.slug,title:u.title,grade:u.grade,path:u.path,slides:count('presentation'),worksheets:count('worksheet')};
 });
}
function auditView(state){
 const rows=schoolContentAudit(state),ready=rows.filter(r=>r.slides&&r.worksheets).length;
 return '<details class="tj-audit"><summary>Толықтыру картасы · '+ready+'/'+rows.length+' тақырыпта слайд пен жұмыс парағы бар</summary><p>Бұл карта жарияланған файлдардың сынып пен тақырыпқа сәйкестігін көрсетеді. Файл саны оның ғылыми немесе әдістемелік сапасын бағаламайды.</p><div class="tj-audit-filters"><label>Сынып<select data-tj-grade><option value="">Барлық сынып</option>'+[7,8,9,10,11].map(g=>'<option value="'+g+'">'+g+'-сынып</option>').join('')+'</select></label><label><input type="checkbox" data-tj-missing> Тек файл жетіспейтін тақырыптар</label><a href="/admin/material/new">Материал қосу →</a></div><div class="tj-table"><table><caption>Қай тақырыпқа не қосу қажет?</caption><thead><tr><th>Тақырып</th><th>Презентация</th><th>Жұмыс парағы</th><th>Әрекет</th></tr></thead><tbody>'+rows.map(r=>'<tr data-tj-audit-row data-grade="'+r.grade+'" data-missing="'+(!r.slides||!r.worksheets)+'"><td><small>'+r.grade+'-сынып</small><a href="'+r.path+'">'+esc(r.title)+'</a></td><td>'+ (r.slides?r.slides+' файл':'Қосу қажет')+'</td><td>'+(r.worksheets?r.worksheets+' файл':'Қосу қажет')+'</td><td><a href="/admin/material/new">Толықтыру ↗</a></td></tr>').join('')+'</tbody></table></div><p data-tj-audit-count role="status">'+rows.length+' тақырып көрсетілді</p></details>';
}
const FIELDS=[
 ['goal','Оқу мақсаты','Сабақ соңында оқушы нені түсіндіре алады?'],
 ['connection','Мектеп–ЖОО байланысы','Мектептегі түсінікке қандай жаңа ғылыми түсіндіру қосылады?'],
 ['explanation','Оқушыға түсіндіру тәсілі','Қандай өмірлік мысал, модель немесе қауіпсіз виртуалды тәжірибе қолданасыз?'],
 ['assessment','Түсінгенін тексеру','Қандай сұрақ қоясыз? Қандай жауап түсінгенін дәлелдейді?']
];
export const PLAN_CRITERIA=['Ғылыми түсіндіру дұрыс','Оқушының жасына сай','Екі деңгейдің байланысы көрінеді','Түсінгенін тексеретін дәлел бар'];
export function planKey(owner,topic){return 'chembridge.teaching-plan.v1:'+encodeURIComponent(owner)+':'+topic;}
export function sanitizePlan(value={}){
 return Object.fromEntries(FIELDS.map(([key])=>[key,typeof value?.[key]==='string'?value[key].slice(0,2400):'']).concat([['reflection',typeof value?.reflection==='string'?value.reflection.slice(0,1200):''],['criteria',PLAN_CRITERIA.map((_,i)=>value?.criteria?.[i]===true)]]));
}
export function createTeacherJourney({state,render}){
 let topic='',stage='school',answers={},status='',activeOwner=null;
 const current=()=>TEACHING_TRACKS.find(t=>t.id===topic)||TEACHING_TRACKS[0];
 const owner=()=>state.user?.id;
 function sync(){if(activeOwner!==owner()){activeOwner=owner();topic='';answers={};status='';stage='school';}}
 function readPlan(){try{return sanitizePlan(JSON.parse(localStorage.getItem(planKey(owner(),current().id))||'{}'));}catch{return sanitizePlan();}}
 function view(){
  sync();
  if(!state.user)return '<section class="tj-page"><h1>Мұғалім жолы</h1><p>Жеке жұмысқа өту үшін аккаунтыңызға кіріңіз.</p><a href="/login?next='+encodeURIComponent(JOURNEY_PATH)+'">Жүйеге кіру →</a></section>';
  const requested=new URLSearchParams(location.search).get('topic');if(TEACHING_TRACKS.some(t=>t.id===requested)&&topic!==requested){topic=requested;stage='school';status='';}else if(!topic)topic=TEACHING_TRACKS[0].id;
  const t=current(),plan=readPlan(),selected=answers[t.id],files=teacherEntries(state.items||[],state.allResources||[]).filter(e=>e.area==='university'&&t.terms.some(term=>(e.row.title+' '+e.row.filename).toLocaleLowerCase('kk').includes(term)));
  return '<div class="tj-page" data-teacher-journey><a class="tj-back" href="/">← Басты бет</a><header class="tj-page-head"><span class="tj-eyebrow">МЕКТЕП → ЖОО → ПЕДАГОГИКАЛЫҚ ПРАКТИКА</span><h1>Білгеніңізді түсіндіре алатын<br><em>мұғалімге айналыңыз.</em></h1><p>Бір тақырыпты үш қырынан зерттеңіз: тірек білімін анықтаңыз, терең түсініңіз және оқушыға түсіндіру тәсілін құрыңыз.</p></header><div class="tj-workspace"><aside class="tj-topics"><h2>Тақырыпты таңдаңыз</h2>'+TEACHING_TRACKS.map((tr,i)=>'<button type="button" data-tj-topic="'+tr.id+'" aria-pressed="'+(tr.id===t.id)+'"><span>0'+(i+1)+'</span><b>'+tr.title+'</b><small>'+tr.grade+'-сыныптан басталады</small></button>').join('')+'<a href="/kabinet">Жеке нәтижелерім →</a></aside><div class="tj-content"><section class="tj-compare"><span class="tj-eyebrow">САБАҚТАСТЫҚТЫ ТҮСІН</span><h2 tabindex="-1">'+t.title+'</h2><div class="tj-stage-tabs" role="tablist" aria-label="Түсіндіру деңгейі">'+STAGES.map(([key,title,sub])=>'<button role="tab" type="button" id="tj-tab-'+key+'" data-tj-stage="'+key+'" aria-controls="tj-stage-panel" aria-selected="'+(stage===key)+'" tabindex="'+(stage===key?0:-1)+'"><b>'+title+'</b><span>'+sub+'</span></button>').join('')+'</div><div id="tj-stage-panel" role="tabpanel" aria-labelledby="tj-tab-'+stage+'"><p class="tj-stage-main">'+esc(t[stage])+'</p>'+(stage==='teach'?'<div class="tj-proof"><b>Түсінгенін қалай білемін?</b><p>'+t.evidence+'</p></div>':'')+'<p class="tj-model-limit"><b>Модель шегі:</b> '+t.boundary+'</p><div class="tj-resource-links"><a href="'+SCHOOL_PATH(t)+'#understand">Мектеп теориясы ↗</a><a href="'+t.bridge+'">Тереңдетіп оқу ↗</a><a href="/universitet">ЖОО материалдары ↗</a></div></div>'+(files.length?'<details class="tj-related"><summary>ЖОО-да жүктелген сәйкес материалдар · '+files.length+'</summary>'+files.map(e=>'<p><a href="'+esc(e.item.path)+'">'+esc(e.row.title||e.row.filename)+'</a></p>').join('')+'</details>':'')+'</section>'+
  '<section class="tj-check"><span class="tj-eyebrow">ҚАТЕ ТҮСІНІКТІ АНЫҚТА</span><h2>'+t.question+'</h2><p>Алдымен өз жауабыңызды таңдаңыз. Кейін оны оқушыға қалай түсіндіретініңізді ойлаңыз.</p><div class="tj-options">'+t.options.map((o,i)=>'<button type="button" data-tj-answer="'+i+'" aria-pressed="'+(selected===i)+'">'+esc(o)+'</button>').join('')+'</div><div data-tj-feedback role="status">'+(Number.isInteger(selected)?'<p class="'+(selected===t.answer?'tj-correct':'tj-incorrect')+'"><b>'+(selected===t.answer?'Дұрыс. ':'Қайта қарастырыңыз. ')+'</b>'+t.why+' <a href="'+SCHOOL_PATH(t)+'#understand">Теорияға оралу →</a></p>':'')+'</div><small>Бұл — түсіндіруге дайындық. Ресми тест ұпайын жеке сабақтағы «Тест» бөлімінде жинайсыз.</small></section>'+
  '<section class="tj-planner"><span class="tj-eyebrow">ӨЗ САБАҒЫҢЫЗҒА АЙНАЛДЫРЫҢЫЗ</span><h2>Менің түсіндіру жоспарым</h2><p class="tj-draft-note">Жоба осы браузерде, өз аккаунтыңыз үшін сақталады. Оқытушыға беру үшін басып шығаруға болады.</p><form data-tj-plan>'+FIELDS.map(([key,label,help])=>'<label>'+label+'<span>'+help+'</span><textarea name="'+key+'" maxlength="2400" rows="3">'+esc(plan[key])+'</textarea><span class="tj-print-value" data-tj-print-value="'+key+'"></span></label>').join('')+'<fieldset><legend>Жоспарды тексеріңіз</legend>'+PLAN_CRITERIA.map((c,i)=>'<label class="tj-criterion"><input type="checkbox" name="criterion-'+i+'" '+(plan.criteria[i]?'checked':'')+'>'+c+'</label>').join('')+'</fieldset><label>Рефлексия<span>Қай тұсын түсіндіру қиын болды? Келесі жолы нені өзгертесіз?</span><textarea name="reflection" maxlength="1200" rows="3">'+esc(plan.reflection)+'</textarea><span class="tj-print-value" data-tj-print-value="reflection"></span></label><div class="tj-plan-actions"><button type="button" data-tj-save>Жобаны осы браузерде сақтау</button><button type="button" data-tj-print>Басып шығару</button></div><p data-tj-plan-status role="status">'+esc(status)+'</p></form></section></div></div>'+(state.user.role==='admin'?auditView(state):'')+'</div>';
 }
 function bind(root){
  if(!root.querySelector('[data-teacher-journey]'))return;
  const user=owner();let dirty=false;
  root.querySelector('[data-tj-plan]')?.addEventListener('input',()=>{dirty=true;root.querySelector('[data-tj-plan-status]').textContent='Жоба өзгерді. Сақтау батырмасын басыңыз.';});
  const capture=()=>{
   const form=root.querySelector('[data-tj-plan]'),data=new FormData(form),value=Object.fromEntries(FIELDS.map(([key])=>[key,data.get(key)]));
   value.reflection=data.get('reflection');value.criteria=PLAN_CRITERIA.map((_,i)=>data.has('criterion-'+i));return sanitizePlan(value);
  };
  const save=()=>{
   if(!user||owner()!==user)return false;
   try{localStorage.setItem(planKey(user,current().id),JSON.stringify(capture()));status='Жоба осы браузерде сақталды.';dirty=false;root.querySelector('[data-tj-plan-status]').textContent=status;return true;}
   catch{status='Жоба сақталмады. Жауаптарыңыз бетте тұр. Басып шығарып алуға болады.';root.querySelector('[data-tj-plan-status]').textContent=status;return false;}
  };
  root.querySelector('[data-tj-save]').onclick=save;
  root.querySelector('[data-tj-print]').onclick=()=>{if(owner()!==user)return;const value=capture();root.querySelectorAll('[data-tj-print-value]').forEach(el=>{el.textContent=value[el.dataset.tjPrintValue];});window.print();};
  function redraw(){render();}
  root.querySelectorAll('[data-tj-topic]').forEach(b=>b.onclick=()=>{
   if(owner()!==user)return;
   if(dirty&&!save())return;
   topic=b.dataset.tjTopic;stage='school';status='';
   const url=new URL(location.href);url.searchParams.set('topic',topic);history.replaceState({},'',url.pathname+url.search+url.hash);
   redraw();root.querySelector('.tj-compare h2')?.focus();
  });
  root.querySelectorAll('[data-tj-stage]').forEach(b=>{
   b.onclick=()=>{if(owner()!==user)return;if(dirty&&!save())return;stage=b.dataset.tjStage;redraw();root.querySelector('#tj-tab-'+stage)?.focus();};
   b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const i=STAGES.findIndex(x=>x[0]===stage),next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;root.querySelector('[data-tj-stage="'+STAGES[next][0]+'"]').click();};
  });
  root.querySelectorAll('[data-tj-answer]').forEach(b=>b.onclick=()=>{
   if(owner()!==user)return;if(dirty&&!save())return;
   answers[current().id]=Number(b.dataset.tjAnswer);redraw();
  });
  const filter=()=>{
   const grade=root.querySelector('[data-tj-grade]').value,missing=root.querySelector('[data-tj-missing]').checked;let count=0;
   root.querySelectorAll('[data-tj-audit-row]').forEach(r=>{r.hidden=!!((grade&&r.dataset.grade!==grade)||(missing&&r.dataset.missing!=='true'));if(!r.hidden)count++;});
   root.querySelector('[data-tj-audit-count]').textContent=count+' тақырып көрсетілді';
  };
  root.querySelector('[data-tj-grade]')?.addEventListener('change',filter);
  root.querySelector('[data-tj-missing]')?.addEventListener('change',filter);
 }
 return {view,bind};
}

export function bindTeacherEntry(root){
 const unit=root.querySelector('[data-school-unit]')?.dataset.schoolUnit;
 const track=TEACHING_TRACKS.find(t=>t.schoolSlug===unit);
 const panel=root.querySelector('#school-panel');
 if(!track||!panel||!root.querySelector('#school-tab-understand[aria-selected="true"]')||panel.querySelector('[data-teacher-entry-link]'))return;
 const aside=document.createElement('aside');aside.className='tj-school-entry';aside.dataset.teacherEntryLink='';
 const text=document.createElement('p');text.textContent='Болашақ мұғалімге: осы ұғым ЖОО-да қалай тереңдейді? Оны оқушыға қалай түсіндіресіз?';
 const link=document.createElement('a');link.href=JOURNEY_PATH+'?topic='+track.id;link.textContent='Сабақтастықты салыстырып, түсіндіру жоспарын құру →';aside.append(text,link);panel.append(aside);
}
