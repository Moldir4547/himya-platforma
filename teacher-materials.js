import {materialRows,cards} from './catalog.js';
export const TEACHER_PATH='/mugalim-materialdary';
export const GROUPS=[
 {slug:'oqytushy',area:'university',title:'Оқытушы',subtitle:'ЖОО материалдары',description:'Дәрістер, силлабус, зертханалық жұмыстар және студенттерге арналған тапсырмалар.'},
 {slug:'ustaz',area:'school',title:'Ұстаз',subtitle:'Мектеп материалдары',description:'7–11-сыныптарға арналған презентациялар, жұмыс парақтары және сабақ материалдары.'}
];
const esc=(s='')=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLocaleLowerCase('kk').trim();
const kind=r=>{const name=(r.filename||'').toLowerCase(),mime=r.mime_type||'';return /\.pptx?$/.test(name)?'ppt':/\.pdf$/.test(name)?'pdf':/\.docx?$/.test(name)?'doc':mime.startsWith('image/')?'image':mime.startsWith('video/')?'video':mime.startsWith('audio/')?'audio':'file';};
export function teacherEntries(items=[],resources=[]){
 const byId=new Map(items.map(i=>[i.id,i]));
 function area(item){
  let current=item,result;const seen=new Set();
  while(current){
   if(seen.has(current.id)||!current.is_published)return null;
   seen.add(current.id);
   if(!result&&['school','university','bridge','diagnostic'].includes(current.area))result=current.area;
   if(!current.parent_id)break;
   current=byId.get(current.parent_id);if(!current)return null;
  }
  return ['school','university'].includes(result)?result:null;
 }
 const visible=items.filter(i=>area(i)),seen=new Set();
 return materialRows(visible,resources,kind).filter(r=>r.published&&!seen.has(r.id)&&seen.add(r.id)).map(row=>({row,item:byId.get(row.item_id),area:area(byId.get(row.item_id))}));
}
export function teacherRoute(path,{state,shell}){
 if(path!==TEACHER_PATH&&!GROUPS.some(g=>path===TEACHER_PATH+'/'+g.slug))return null;
 const all=teacherEntries(state.items,state.allResources),group=GROUPS.find(g=>path===TEACHER_PATH+'/'+g.slug);
 const heading='<header class="teacher-head"><small>Мектеп–ЖОО сабақтастығы</small><h1>Мұғалім материалдары</h1><p>Бағытты таңдап, қажетті оқу материалын ашыңыз немесе жүктеп алыңыз.</p>'+(state.user?.role==='admin'?'<a href="/admin/materials">Материалдарды басқару →</a>':'')+'</header>';
 if(!group)return shell('<div class="teacher-hub">'+heading+'<div class="teacher-directions">'+GROUPS.map(g=>'<a class="teacher-direction" href="'+TEACHER_PATH+'/'+g.slug+'"><small>'+g.subtitle+'</small><h2>'+g.title+'</h2><p>'+g.description+'</p><span>'+all.filter(e=>e.area===g.area).length+' файл</span><b>Материалдарды көру →</b></a>').join('')+'</div></div>');
 const entries=all.filter(e=>e.area===group.area),topics=[...new Map(entries.map(e=>[e.item.id,e.item])).values()],types=[...new Set(entries.map(e=>e.row.type))],labels={ppt:'Презентация',pdf:'PDF',doc:'Word',image:'Сурет',video:'Бейне',audio:'Аудио',file:'Файл'};
 return shell('<div class="teacher-hub"><p><a href="'+TEACHER_PATH+'">← Мұғалім материалдары</a></p>'+heading+'<nav class="teacher-group-nav" aria-label="Материал бағыты">'+GROUPS.map(g=>'<a href="'+TEACHER_PATH+'/'+g.slug+'" '+(g===group?'aria-current="page"':'')+'>'+g.title+' · '+g.subtitle+'</a>').join('')+'</nav><h2>'+group.title+'</h2><p>'+group.description+'</p><form data-teacher-filters class="teacher-filters" role="search" aria-label="Мұғалім материалдарын іздеу"><label>Материал іздеу<input type="search" name="query" placeholder="Тақырып немесе файл атауы" autocomplete="off"></label><label>Тақырып<select name="topic" aria-label="Тақырып"><option value="">Барлық тақырып</option>'+topics.map(i=>'<option value="'+esc(i.id)+'">'+esc(i.title)+'</option>').join('')+'</select></label><label>Материал түрі<select name="type" aria-label="Материал түрі"><option value="">Барлық түрі</option>'+types.map(t=>'<option value="'+esc(t)+'">'+esc(labels[t]||t)+'</option>').join('')+'</select></label></form><p data-teacher-count role="status" aria-live="polite">'+entries.length+' материал</p><div class="teacher-material-grid">'+entries.map(e=>'<div data-teacher-entry data-search="'+esc(norm([e.row.title,e.row.filename,e.row.description,e.item.title].join(' ')))+'" data-topic="'+esc(e.item.id)+'" data-type="'+esc(e.row.type)+'">'+cards([e.row])+'<p class="teacher-source"><a href="'+esc(e.item.path)+'">Сабаққа өту → '+esc(e.item.title)+'</a></p></div>').join('')+'</div><p data-teacher-empty '+(entries.length?'hidden':'')+'>Материал табылмады. Басқа сөзбен іздеп көріңіз немесе сүзгіні өзгертіңіз.</p></div>');
}
export function bindTeacherMaterials(root){
 // Shared learning adapter runs before the app binds its navigation and file
 // actions, so these links use the existing base-path and resource handlers.
 const nav=root.querySelector('#main-nav');
 if(nav&&!nav.querySelector('[data-teacher-nav]')){
  const link=document.createElement('a');link.href=TEACHER_PATH;link.textContent='Мұғалім материалдары';link.dataset.teacherNav='';
  if(root.querySelector('.teacher-hub'))link.setAttribute('aria-current','page');
  nav.insertBefore(link,nav.querySelector('a[href="/materials"]'));
 }
 const home=root.querySelector('.learn-home');
 if(home&&!root.querySelector('.teacher-home-entry')){
  const section=document.createElement('section');section.className='teacher-home-entry';
  section.innerHTML='<div><small>Педагогтерге арналған</small><h2>Мұғалім материалдары</h2><p>ЖОО оқытушысы мен мектеп ұстазына қажетті материалдар.</p></div><a class="primary-button" href="'+TEACHER_PATH+'">Бөлімді ашу →</a>';
  home.after(section);
 }
 if(root.querySelector('.teacher-hub'))document.title='Мұғалім материалдары — ChemBridge';
 const form=root.querySelector('[data-teacher-filters]');if(!form)return;
 const group=GROUPS.find(g=>root.querySelector('.teacher-group-nav [aria-current]')?.textContent.startsWith(g.title));
 document.title=(group?group.title+' · ':'')+'Мұғалім материалдары — ChemBridge';
 const filter=()=>{
  const f=new FormData(form),q=norm(f.get('query'));let count=0;
  root.querySelectorAll('[data-teacher-entry]').forEach(card=>{
   card.hidden=!(card.dataset.search.includes(q)&&(!f.get('topic')||card.dataset.topic===f.get('topic'))&&(!f.get('type')||card.dataset.type===f.get('type')));
   if(!card.hidden)count++;
  });
  root.querySelector('[data-teacher-count]').textContent=count+' материал';
  root.querySelector('[data-teacher-empty]').hidden=count>0;
 };
 form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('submit',e=>{e.preventDefault();filter();});
}
