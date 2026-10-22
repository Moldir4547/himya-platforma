const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s||'').toLocaleLowerCase('kk').replace(/[^\p{L}\p{N}]+/gu,' ');
const aliases={
'safety-mixtures':['кіріспе','таза зат','қоспа','қауіпсіз'],
'states-changes':['агрегат','құбылыс','химиялық реакциялар'],
'atoms-substances':['атомдар','молекула','заттардың құпиясы'],
'structure-isotopes':['атом құрылысы','изотоп','атомдар'],
'air-combustion':['жану','ауа','оттек'],
'acids-indicators':['қышқыл','негіз','индикатор'],
'periodic-table':['периодтық'],
'formulas-masses':['валенттілік','салыстырмалы атомдық масса'],
'body-elements':['ағза','тыныс'],
'minerals-kazakhstan':['кендер','минерал','қазақстан'],
'electrons-ions':['электрон','атомдағы'],
'equations-conservation':['реакция теңдеу','заттардың формула','массаның сақталу'],
'metals-corrosion':['коррозия','металл белсенді'],
'mole-avogadro':['зат мөлшері','авогадро','молярлық'],
'stoichiometry-gases':['стехиометр','көлемдік қатынас'],
'reaction-energy':['энергия','жылу эффект'],
'hydrogen':['сутек'],
'oxygen-ozone':['оттек','озон','аллотроп'],
'periodicity':['периодтық'],
'bonding':['байланыс','кристалдық'],
'solutions':['ерітінді','ерігіштік','концентрация'],
'oxides':['оксид','бейорганикалық қосылыстардың негізгі кластары','генетикалық'],
'acids-bases':['қышқыл','негіз','бейорганикалық қосылыстардың негізгі кластары','генетикалық'],
'salts-genetic':['тұз','генетикалық','бейорганикалық қосылыстардың негізгі кластары'],
'carbon':['көміртек','көмірқышқыл'],
'water-hardness':['су кермекті','тазарту','су және'],
'electrolytes':['электролиттік','диссоциация'],
'ionic-reactions':['ион алмасу','иондық реакци'],
'salt-hydrolysis':['гидролиз'],
'qualitative-analysis':['сапалық анықтау','сапалық талдау'],
'limiting-mixtures':['артық реагент','өнім шығым','қоспа'],
'reaction-rate':['реакция жылдамдығы','реакциялардың жылдамдығы','катализ'],
'equilibrium':['қайтымды','тепе теңдік','шателье'],
'redox':['тотығу','электрондық баланс'],
'metals-alloys':['құйма','металдар'],
'alkali-calcium-aluminium':['натрий','кальций','алюминий'],
'halogens-hcl':['галоген','хлор','тұз қышқыл'],
'sulfur':['күкірт'],
'nitrogen-ammonia':['азот','аммиак'],
'phosphorus-fertilizers':['фосфор','тыңайтқыш'],
'silicon':['кремний','силикат'],
'elements-environment':['ағза','ауыр металл','ластану'],
'atomic-orbitals':['атом құрылысы','орбиталь','электрондық конфигурация'],
'periodic-properties':['периодтық','периодт'],
'bonding-geometry':['байланыс','гибрид'],
'stoichiometry':['стехиометр','химияның негізгі заң'],
'enthalpy':['термохим','энтальп'],
'entropy-gibbs':['энтроп','гиббс'],
'kinetics':['кинетика','кинетикалық','реакция жылдамдығы','катализ'],
'industrial-equilibrium':['тепе теңдік','шателье'],
'redox-balance':['тотығу','электрондық баланс'],
'galvanic-cells':['гальваникалық','аккумулятор'],
'electrolysis':['электролиз'],
'analytical-methods':['талдау','хроматограф'],
'halogens':['галоген','галогенид'],
'groups-one-two':['сілтілік','сілтілік жер','1 және 2 топ'],
'group-fourteen':['14 топ','кремний','көміртек'],
'yield-calculations':['өнім шығым','шығым'],
'nitrogen-industry':['азот','аммоний','аммиак'],
'nitrogen-environment':['азот','тыңайтқыш','no'],
'sulfur-oxides':['күкірт','сульфид'],
'sulfuric-process':['күкірт қышқыл'],
'acid-base-ph':['қышқыл','негіз','ph'],
'buffers':['буфер'],
'titration':['титрлеу','индикатор'],
'metallurgy':['металлург','шойын','болат','құйма'],
'electroplating':['электролиз','гальваностег'],
'recycling':['қайта өңдеу'],
'transition-complexes':['ауыспалы','кешен','комплекс'],
'nanomaterials':['нано','жаңа материал'],
'green-chemistry':['жасыл химия','атмосфера','жаһандық']
};
export function matchesTopic(filename,u,kind,metadata={}){
 const name=normalize([filename,metadata.title,metadata.topicTitle].filter(Boolean).join(' '));
 if(kind==='presentation'){
  const ppt=/\.pptx?$/i.test(filename.trim());
  const markedPdf=/\.pdf$/i.test(filename.trim())&&(/презентац|слайд|presentation|slide/iu.test(filename)||normalize(metadata.category)==='презентация');
  if(!ppt&&!markedPdf)return false;
  if(/жұмыс парағы/iu.test(filename))return false;
 }
 if(kind==='worksheet'&&!/жұмыс парағы/iu.test(filename))return false;
 return !u||(aliases[u.slug]||[u.title]).some(term=>name.includes(normalize(term)));
}
// Render only resource cards. Never ask the lesson renderer for theory, video,
// assessment or progress markup when a user requests a file-only panel.
export function schoolFileMaterials(items=[],resources=[],grade,u,kind='presentation'){
 const parent=items.find(item=>item.path==='/mektep/teoriya/'+grade+'-synyp');
 if(!parent)return '<p>Сынып материалдары әзірге қосылмаған.</p>';
 const byId=new Map(items.map(item=>[item.id,item]));
 function inGrade(item){
  const seen=new Set();
  while(item){
   if(seen.has(item.id)||!item.is_published)return false;
   seen.add(item.id);if(item.id===parent.id)return true;
   item=byId.get(item.parent_id);
  }
  return false;
 }
 const seen=new Set(),files=resources.filter(r=>{
  const item=byId.get(r.item_id);
  if(!item||!inGrade(item)||r.is_published===false||r.is_published===0||seen.has(r.id))return false;
  if(!matchesTopic(r.filename||'',u,kind,{...r,topicTitle:item.title}))return false;
  seen.add(r.id);return true;
 });
 if(!files.length)return '<p class="school-file-empty">'+(kind==='presentation'?'Бұл бөлімге презентация әзірге жүктелмеген.':'Бұл тақырыпқа жұмыс парағы әзірге жүктелмеген.')+'</p>';
 return '<div class="resource-list school-file-list">'+files.map(r=>'<article class="resource-card"><span class="file-type">'+esc((r.filename||'').split('.').pop().toUpperCase())+'</span><strong>'+esc(r.filename)+'</strong><div class="material-actions"><button data-open-resource="'+esc(r.id)+'">Ашу</button><button data-download-resource="'+esc(r.id)+'">Жүктеп алу</button></div></article>').join('')+'</div>';
}
// The wrapper receives the platform's existing resource markup: original file IDs,
// access controls and open/download actions stay with their original resources.
export function filterTopicMaterials(root,u){
 root.querySelectorAll('[data-topic-materials]').forEach(host=>{
  const cards=[...host.querySelectorAll('.resource-card')];
  const kept=[],seen=new Set();
  for(const card of cards){
   const title=card.querySelector('strong')?.textContent||'';
   const keep=matchesTopic(title,u,host.dataset.topicMaterials);
   const id=card.querySelector('[data-open-resource]')?.dataset.openResource||title;
   if(keep&&!seen.has(id)){kept.push(card);seen.add(id);}
  }
  host.replaceChildren(...kept);
  if(!kept.length){
   host.replaceChildren();
   const p=document.createElement('p');
   p.textContent=host.dataset.topicMaterials==='presentation'?'Бұл тақырыпқа сәйкес дайын презентация әзірге жүктелмеген. Түсіну бөліміндегі материалмен жалғастырыңыз.':'';
   if(p.textContent)host.append(p);
  }
  host.querySelectorAll('h2').forEach(h=>{if(h.textContent==='Курс материалдары')h.remove();});
 });
}
export function topicMaterials(u,markup,kind){
 return '<div class="topic-materials" data-topic-materials="'+kind+'">'+markup+'</div>';
}
export const CLASS_CARDS=[
 ['Оксидтер','Элемент пен оттектің қосылыстары. Оксидте оттектің тотығу дәрежесі −2.','MgO','Магний оксиді','oxide'],
 ['Қышқылдар','Сулы ерітіндіде гидроксоний иондарының H₃O⁺ мөлшерін арттырады.','HCl','Тұз қышқылы','acid'],
 ['Негіздер','Металл атомы мен гидроксид топтарынан тұрады. Еритін негіздер — сілтілер.','NaOH','Натрий гидроксиді','base'],
 ['Тұздар','Металл не аммоний катионы мен қышқыл қалдығының анионынан тұрады.','NaCl','Натрий хлориді','salt']
];
const classes=u=>['oxides','acids-bases','salts-genetic'].includes(u.slug);
function classMap(){return '<div class="ws-class-grid">'+CLASS_CARDS.map(([name,definition,formula,example,tone],i)=>'<article class="ws-concept '+tone+'"><span class="ws-number">0'+(i+1)+'</span><h3>'+name+'</h3><p>'+definition+'</p><strong class="ws-formula">'+formula+'</strong><small>'+example+'</small></article>').join('')+'</div><aside class="ws-subtypes"><h3>Тұздардың екі тобы</h3><p><b>Карбонаттар:</b> CO₃²⁻ анионы бар. Мысал: CaCO₃.</p><p><b>Сульфаттар:</b> SO₄²⁻ анионы бар. Мысал: Na₂SO₄.</p><strong>Карбонаттар мен сульфаттар — тұздардың түрлері.</strong></aside>';}
export function worksheetIntro(u,svg){
 const concepts=classes(u)?classMap():'<div class="ws-concepts">'+u.notes.map((n,i)=>'<article class="ws-concept tone-'+i+'"><span class="ws-number">0'+(i+1)+'</span><h3>'+esc(u.topics[i]||'Ғылыми қорытынды')+'</h3><p>'+esc(n)+'</p></article>').join('')+'</div>';
 return '<article class="school-worksheet"><header class="ws-header"><span>Жұмыс парағы · '+u.grade+'-сынып · '+esc(u.paras)+'</span><h2>'+esc(u.title)+'</h2><p>Байқа → салыстыр → есепте → түсіндір</p><button type="button" data-worksheet-print>Басып шығару / PDF</button></header><div class="ws-paper-identity">Аты-жөні: ____________________ Сыныбы: ______ Күні: __________</div><details class="ws-reference"><summary>Тірек сызба · еске түсір</summary>'+concepts+'<div class="ws-visual">'+svg+'</div><p class="ws-equation">'+esc(u.f.formula)+'</p></details><section class="ws-paper-task"><h3>1. Негізгі ойды тап</h3><p>'+esc(u.topics.join(' · '))+': осы ұғымдардың байланысын сызбамен көрсетіп, бір мысал жазыңыз.</p><div class="ws-writing-lines" aria-label="Қағаздағы жауап орны"></div></section><section class="ws-paper-task"><h3>2. Өмірмен байланыстыр</h3><p>'+esc(u.life)+'</p><p>Қысқа жауап беріңіз. Оны сабақтағы бір дерекпен негіздеңіз.</p><div class="ws-writing-lines" aria-label="Қағаздағы жауап орны"></div></section><section class="ws-online-task"><h3>3. Есепте және тексер</h3><p>Сандық жауаптарды төменде тексеріп, нәтижесін аккаунтыңызға сақтай аласыз. Алғашқы екі тапсырманы дәптерде немесе басып шығарылған парақта орындаңыз.</p></section></article>';
}
export function worksheetEnd(u){return '<aside class="ws-reflection"><h3>Өзіңді тексер</h3><ul><li>Негізгі ұғымдарды ажыраттым.</li><li>Есепте өлшем бірліктерін көрсеттім.</li><li>Жауабымды дерекпен түсіндірдім.</li></ul><p>Қиналсаңыз, <a href="#understand" data-school-tab="understand">Түсіну бөліміне оралыңыз →</a></p></aside>';}
export function bindWorksheet(root){root.querySelector('[data-worksheet-print]')?.addEventListener('click',()=>{const reference=root.querySelector('.ws-reference');const wasOpen=reference?.open;if(reference)reference.open=true;try{window.print();}finally{if(reference)reference.open=wasOpen;}});}
