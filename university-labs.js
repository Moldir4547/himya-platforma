// Map by the existing lesson topic/path, not the number printed in an uploaded file.
export const UNIVERSITY_LABS = [
 {slug:'zerthanalyq-sabaq-beiorganikalyq-qosylystardyn-negizgi-klastary-oksidter-qyshqyldar-negizder-tuzdar',file:'university-lab-classes.html',title:'Қышқылдар, негіздер және тұздар',description:'Заттардың қасиеттерін тәжірибеде бақылап, реакция теңдеулерін салыстырыңыз.'},
 {slug:'zerthanalyq-sabaq-5-komirteginin-iv-oksidinin-salystyrmaly-moldik-massasyn-anyqtau',file:'university-lab-co2.html',title:'CO₂ молярлық массасын анықтау',description:'Жағдайларды тіркеп, колбаны өлшеңіз, газбен толтырыңыз және нәтижені есептеңіз.',note:'Авторлық HTML файлда №4 деп белгіленген. Платформада осы тақырып №5 зертханалық сабаққа сәйкес келеді.'},
 {slug:'zerthanalyq-sabaq-4-metall-ekvialentin-sudy-ygystyru-adisimen-anyqtau-magniidin-ekvivalenttik-massasyn-anyqtau',file:'university-lab-metal.html',title:'Металдың эквиваленттік массасын анықтау',description:'Аспапты құрастырып, герметикалығын тексеріңіз. Металды өлшеп, бөлінген сутек көлемі арқылы эквиваленттік массасын есептеңіз.',note:'Авторлық HTML файлда №3 деп белгіленген. Платформада осы тақырып №4 зертханалық сабаққа сәйкес келеді.'}
];
const course='/universitet/ozin-ozi-daiyndau';
export function labForPath(path){
 return UNIVERSITY_LABS.find(lab=>path.replace(/^\/himya-platforma(?=\/|$)/,'').replace(/\/$/,'')===course+'/'+lab.slug);
}
export function bindUniversityLabs(root,pathname=location.pathname){
 const path=pathname.replace(/^\/himya-platforma(?=\/|$)/,'').replace(/\/$/,'');
 if(path!==course&&!labForPath(path))return;
 function insert(lab,anchor){
  if(!anchor||root.querySelector('[data-university-lab="'+lab.slug+'"]'))return;
  const section=document.createElement('section');
  section.className='university-html-lab';
  section.dataset.universityLab=lab.slug;
  const heading=document.createElement('h2');heading.textContent='Виртуалды зертхана · '+lab.title;
  const copy=document.createElement('p');copy.textContent=lab.description;
  section.append(heading,copy);
  if(lab.note){const note=document.createElement('p');note.className='university-lab-note';note.textContent=lab.note;section.append(note);}
  const details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='Виртуалды нұсқаны ашу';details.append(summary);
  const frame=document.createElement('iframe');
  frame.title=lab.title;frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('loading','lazy');
  const url=new URL(lab.file,document.baseURI).href;
  details.addEventListener('toggle',()=>{if(details.open&&!frame.hasAttribute('src'))frame.src=url;});
  details.append(frame);section.append(details);
  const link=document.createElement('a');
  link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Жеке бетте ашу ↗';
  section.append(link);anchor.after(section);
 }
 if(path===course){
  root.querySelectorAll('a.lms-unit-card').forEach(card=>{
   const lab=labForPath(new URL(card.getAttribute('href'),document.baseURI).pathname);
   if(lab)insert(lab,card);
  });
 }else{
  const main=root.querySelector('.lesson-main');
  insert(labForPath(path),main?.querySelector('.resource-list')||main?.querySelector('.lesson-body'));
 }
}
