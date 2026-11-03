/* Device-local reading preferences; runs before CSS to avoid a theme flash. */
(()=>{
 'use strict';
 const KEY='chembridge.appearance.v1',html=document.documentElement;
 const system=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
 const valid=v=>v==='light'||v==='dark';
 let preference=null;
 try{const saved=localStorage.getItem(KEY);if(valid(saved))preference=saved;}catch{}
 const theme=()=>preference||(system?.matches?'dark':'light');
 function syncControl(button){
  const dark=theme()==='dark';
  if(button.dataset.appearanceMode===theme())return;
  button.dataset.appearanceMode=theme();
  button.setAttribute('aria-label','Қараңғы режим');
  button.setAttribute('aria-pressed',String(dark));
  button.title=dark?'Жарық режимге ауысу':'Қараңғы режимге ауысу';
  button.innerHTML='<span aria-hidden="true">'+(dark?'☀':'☾')+'</span><span class="appearance-label">'+(dark?'Күн':'Түн')+'</span>';
 }
 function apply(){
  html.dataset.theme=theme();
  html.style.colorScheme=theme();
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme()==='dark'?'#111927':'#d7e2ed');
  document.querySelectorAll('[data-appearance-toggle]').forEach(syncControl);
 }
 function announce(message,error=false){
  let el=document.getElementById('appearance-status');
  if(!el){el=document.createElement('p');el.id='appearance-status';el.className='appearance-status';el.setAttribute('role','status');document.body.append(el);}
  el.dataset.visible=String(error);el.textContent=message;
 }
 function toggle(){
  preference=theme()==='dark'?'light':'dark';apply();
  try{localStorage.setItem(KEY,preference);announce(preference==='dark'?'Қараңғы режим қосылды.':'Жарық режим қосылды.');}
  catch{announce('Режим қосылды, бірақ браузер таңдауды сақтауға рұқсат бермеді.',true);}
 }
 apply();
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const e of entries)overflow(e.target);}):null;
 function overflow(el){el.dataset.overflow=String(el.scrollWidth>el.clientWidth+1);}
 function mount(){
  const header=document.querySelector('.topbar');
  if(header&&!header.querySelector('[data-appearance-toggle]')){
   const button=document.createElement('button');button.type='button';button.className='appearance-toggle';button.dataset.appearanceToggle='';button.onclick=toggle;syncControl(button);header.append(button);
  }
  document.querySelectorAll('table').forEach(table=>{
   if(table.closest('.mobile-table-scroll,[contenteditable="true"],svg')||table.getAttribute('role')==='presentation')return;
   if(table.parentElement?.matches('.tj-table,.analytics-table-wrap,.table-wrap,.table-scroll')){table.parentElement.classList.add('reading-table-scroll');return;}
   const wrap=document.createElement('div');wrap.className='mobile-table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',(table.caption?.textContent?.trim()||'Кесте — көлденең айналдыруға болады').slice(0,140));
   table.before(wrap);wrap.append(table);if((table.rows[0]?.cells.length||0)>3)wrap.classList.add('wide-table');
   overflow(wrap);resize?.observe(wrap);
  });
 }
 function start(){
  mount();
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount();});}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',()=>document.querySelectorAll('.mobile-table-scroll').forEach(overflow),{passive:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.addEventListener('storage',event=>{if(event.key!==KEY)return;preference=valid(event.newValue)?event.newValue:null;apply();});
 system?.addEventListener?.('change',()=>{if(!preference)apply();});
})();
