import {html,handIn} from './worksheet-quests.js';
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const unavailable='Жұмысты қабылдау қызметі қосылмаған. Парақты сақтап қойып, мұғалімге хабарласыңыз.';
const failure=e=>/ws_|schema cache|does not exist/i.test(e.message)||e.status===404?unavailable:e.message==='invalid_pair'?'Код табылмады. Мұғалім берген кодты тексер.':e.message==='recipient_changed'?'Алушы өзгерді. Бетті жаңартып, мұғалімнің атын тексер.':'Байланыс орнамады. Интернетті тексеріп, қайта көріңіз.';
export async function photo(file){
 if(!file||!file.type.startsWith('image/')||file.size>24*1024*1024)throw Error('24 МБ-тан шағын фотосуретті таңда.');
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;await img.decode().catch(()=>{throw Error('Сурет ашылмады. JPG немесе PNG нұсқасын таңда.');});
  const scale=Math.min(1,1750/Math.max(img.width,img.height)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  for(const q of [.88,.74,.6,.46]){const data=canvas.toDataURL('image/jpeg',q).split(',')[1];if(data&&data.length<=1400000)return data;}
  throw Error('Бір парақты жақынырақ түсіріп, қайта таңда.');
 } finally{URL.revokeObjectURL(url);}
}
export function bindDelivery(root,{store,state,units}){
 root.querySelector('[data-cq-print]')?.addEventListener('click',()=>window.print());
 const gradePanel=root.querySelector('[data-cq-grade-upload]');if(gradePanel){const pick=gradePanel.querySelector('[data-cq-pick]'),slot=gradePanel.querySelector('[data-cq-slot]');pick.onchange=()=>{const u=units.find(v=>v.slug===pick.value);slot.innerHTML=u?handIn(u,state.user):'';if(u)bindDelivery(slot,{store,state,units});};}
 const sendBox=root.querySelector('[data-cq-send]'),inbox=root.querySelector('[data-cq-inbox]');
 if(!sendBox&&!inbox)return;
 const user=state.user,owner=user?.id,box=sendBox||inbox,$=s=>box.querySelector(s);
 if(!owner)return;
 const api=async(path,body)=>{
  if(!store?.validSession)throw Error('ws_service');
  const session=await store.validSession();
  if(!box.isConnected||state.user?.id!==owner||session?.user?.id!==owner)throw Error('session_changed');
  return store.request('/rest/v1/'+path,{headers:store.headers(session.access_token),...(body===undefined?{}:{method:'POST',body:JSON.stringify(body)})});
 };
 const rpc=(name,args={})=>api('rpc/ws_'+name,args);
 if(sendBox){
  const u=units.find(u=>u.slug===box.dataset.cqSend),btn=$('[data-send]');if(!u||!btn)return;
  let recipient=null,jpeg='',revision=0,busy=false,connected=false;
  const update=()=>{btn.disabled=!recipient||!jpeg||busy||!connected;};
  async function refresh(){
   recipient=null;connected=false;update();
   const rows=await rpc('recipient',{p_grade:u.grade});recipient=rows?.[0];connected=true;
   $('[data-recipient]').textContent=recipient?'Алушы: '+recipient.name+' · '+u.grade+'-сынып':'Бұл сыныпқа мұғалім әлі таңдалмаған.';
   $('[data-pair]').open=!recipient;update();
   if(recipient){const own=await api('ws_photos?learner=eq.'+owner+'&teacher=eq.'+recipient.id+'&grade=eq.'+u.grade+'&slug=eq.'+u.slug+'&select=sent_at&limit=1');
    if(own?.length)$('[data-result]').textContent='Соңғы жіберілген жұмыс: '+new Date(own[0].sent_at).toLocaleString('kk-KZ')+'. Қайта жіберсең, осы мұғалімге берілген алдыңғы фото жаңарады.';}
  }
  refresh().catch(e=>{$('[data-recipient]').textContent=failure(e);});
  $('[data-connect]').onclick=async e=>{
   if(busy)return;
   const code=$('[data-code]').value.trim();if(!uuid.test(code)){$('[data-result]').textContent='Кодты толық көшіріп енгіз.';return;}
   busy=true;update();e.target.disabled=true;
   try{await rpc('pair',{p_grade:u.grade,p_code:code});$('[data-result]').textContent='';await refresh();$('[data-code]').value='';}
   catch(err){recipient=null;$('[data-result]').textContent=failure(err);}
   finally{busy=false;$('[data-connect]').disabled=false;update();}
  };
  for(const input of box.querySelectorAll('input[type=file]'))input.onchange=async()=>{
   if(!input.files?.length)return;const v=++revision;const file=input.files[0];jpeg='';update();$('[data-preview]').hidden=true;$('[data-result]').textContent='';$('[data-file-status]').textContent='Сурет дайындалуда…';
   try{const data=await photo(file);if(v!==revision)return;jpeg=data;$('[data-preview]').src='data:image/jpeg;base64,'+data;$('[data-preview]').hidden=false;$('[data-file-status]').textContent='Жазуды және алушының атын тексер.';}
   catch(err){if(v===revision)$('[data-file-status]').textContent=err.message;}finally{input.value='';update();}
  };
  btn.onclick=async()=>{if(btn.disabled)return;busy=true;update();box.querySelectorAll('input, [data-connect]').forEach(el=>el.disabled=true);$('[data-result]').textContent='Жіберілуде…';
   try{const receipt=await rpc('send',{p_grade:u.grade,p_slug:u.slug,p_teacher:recipient.id,p_jpeg:jpeg});if(!uuid.test(receipt||''))throw Error('missing_receipt');$('[data-result]').textContent='Қабылданды. Жұмысың '+recipient.name+' мұғалімінің «Келген жұмыс парақтары» бөлімінде.';jpeg='';$('[data-preview]').hidden=true;$('[data-preview]').removeAttribute('src');$('[data-file-status]').textContent='';}
   catch(err){$('[data-result]').textContent=failure(err)+' Қабылданғаны расталмады.';}
   finally{busy=false;box.querySelectorAll('input, [data-connect]').forEach(el=>el.disabled=false);update();}
  };
 }else if($('[data-refresh]')){
  const names=new Map(units.map(u=>[u.slug,u.title]));let offset=0,loading=false;
  rpc('code').then(code=>{$('[data-my-code]').textContent=code?'Оқушыларға беретін кодыңыз: '+code:'Код алу үшін әкімші сізге қабылдау құқығын беруі керек.';}).catch(e=>{$('[data-my-code]').textContent=failure(e);});
  async function list(reset){if(loading)return;loading=true;
   if(reset){offset=0;$('[data-rows]').replaceChildren();}$('[data-more]').hidden=true;$('[data-list-status]').textContent='Жүктелуде…';
   try{const rows=await api('ws_photos?teacher=eq.'+owner+'&select=id,learner_name,grade,slug,sent_at&order=sent_at.desc,id.asc&offset='+offset+'&limit=26');
    for(const row of rows.slice(0,25)){const card=document.createElement('article');card.className='cq-submission';
     card.innerHTML='<strong>'+html(row.learner_name)+'</strong> · '+html(row.grade)+'-сынып<p>'+html(names.get(row.slug)||row.slug)+' · '+html(new Date(row.sent_at).toLocaleString('kk-KZ'))+'</p><button type="button">Фотосын ашу</button><p role="status"></p>';
     const b=card.querySelector('button');b.onclick=async()=>{const existing=card.querySelector('img');if(existing){existing.remove();b.textContent='Фотосын ашу';return;}b.disabled=true;
      try{const [r]=await api('ws_photos?id=eq.'+encodeURIComponent(row.id)+'&teacher=eq.'+owner+'&select=jpeg');if(!r)throw Error('missing');const img=document.createElement('img');img.alt='Оқушының жұмыс парағы';img.src='data:image/jpeg;base64,'+r.jpeg;card.append(img);b.textContent='Фотосын жабу';}
      catch(e){card.querySelector('[role=status]').textContent=failure(e);}finally{b.disabled=false;}};
     $('[data-rows]').append(card);}
    offset+=Math.min(25,rows.length);$('[data-more]').hidden=rows.length<=25;$('[data-list-status]').textContent=offset?'Көрсетілген жұмыс саны: '+offset:'Сізге әзірге жұмыс келген жоқ.';
   }catch(e){$('[data-list-status]').textContent=failure(e);}finally{loading=false;}
  }
  $('[data-refresh]').onclick=()=>list(true);$('[data-more]').onclick=()=>list(false);list(true);
  const grant=$('[data-grant]');if(grant){let ready=false;grant.ontoggle=async()=>{if(!grant.open||ready)return;
   try{const users=(await store.listUsers()).filter(t=>t.participant_type==='teacher'||t.role==='admin');$('[data-teacher]').replaceChildren(new Option('Мұғалімді таңдаңыз',''),...users.map(t=>new Option(t.display_name+' · '+t.email,t.id)));ready=true;$('[data-teacher]').onchange=()=>{$('[data-approve]').disabled=!$('[data-teacher]').value;};}catch(e){$('[data-grant-status]').textContent=failure(e);}
  };
  $('[data-approve]').onclick=async()=>{try{await rpc('authorize',{p_teacher:$('[data-teacher]').value});$('[data-grant-status]').textContent='Қабылдау құқығы берілді. Мұғалім осы бөлімнен өз кодын алады.';}catch(e){$('[data-grant-status]').textContent=failure(e);}};}
 }
}
