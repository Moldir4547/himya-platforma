
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function readings11(l,index){
 const m=l.measurements||{},i=index;
 if(l.kind==='ph'){const c=m.initialM*m.aliquotMl/m.finalMl;return{acidPH:-Math.log10(i>=4?c:m.initialM),basePH:m.pKw+Math.log10(i>=5?c:m.initialM),finalM:c};}
 if(l.kind==='buffer'){const h=m.acidM*m.acidMl/1000,n=m.componentM*m.volumeMl/1000,c=h/((m.volumeMl+m.acidMl)/1000);return{waterPH:i>=3?-Math.log10((c+Math.sqrt(c*c+4*10**(-m.pKw)))/2):m.pKw/2,bufferPH:m.pKa+(i>=4?Math.log10((n-h)/(n+h)):0)};}
 if(l.kind==='titration'){const v=i>=5?m.finalMl:i>=4?9.8:0,excess=m.titrantM*(v-m.equivalenceMl)/1000,total=(m.aliquotMl+v)/1000;return{volume:v,acidM:m.titrantM*(m.finalMl-m.initialMl)/m.aliquotMl,pH:Math.abs(excess)<1e-14?m.pKw/2:excess>0?m.pKw+Math.log10(excess/total):-Math.log10(-excess/total)};}
 if(l.kind==='plating'){const delta=m.molarMassCu*m.currentA*m.seconds/(m.electrons*m.faraday);return{delta,spoonG:m.spoonInitialG+(i>=5?delta:0),anodeG:m.anodeInitialG-(i>=5?delta:0)};}
 return{};
}
export function scene11(l,s,task){
 const i=Math.min(l.steps.length,s.index+(task?1:0)),k=l.kind,r=readings11(l,i),ready=l.tools.every(t=>s.tools.includes(t)),done=i===l.steps.length;
 const tx=(x,y,t,size=14,color='#294e55')=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="'+color+'">'+esc(t)+'</text>';
 const fmt=(n,p=2)=>n.toFixed(p).replace('.',',');
 const display=(x,y,label,value)=>'<rect x="'+x+'" y="'+y+'" width="162" height="67" rx="8" fill="#334e57"/><rect x="'+(x+10)+'" y="'+(y+10)+'" width="142" height="32" rx="3" fill="#d7e6d0"/>'+tx(x+81,y+33,value,20)+tx(x+81,y+57,label,11,'#f1f6ed');
 const beaker=(x,color='#dcebed',filled=true)=>'<path d="M'+(x-50)+' 185v118q0 17 50 17t50-17V185" stroke="#7f9ca3" stroke-width="3" fill="url(#g11glass)"/>'+(filled?'<path d="M'+(x-46)+' 244h92v58q0 13-46 13t-46-13z" fill="'+color+'" opacity=".78"/><ellipse cx="'+x+'" cy="244" rx="46" ry="4" fill="'+color+'" opacity=".72"/>':'')+'<path d="M'+(x-36)+' 197v98" stroke="#fff" stroke-width="4" opacity=".7"/>';
 const vial=(x,color='#dcebed',filled=true,gel=false)=>'<path d="M'+(x-25)+' 173v121q0 24 25 24t25-24V173" fill="url(#g11glass)" stroke="#7b99a1" stroke-width="3"/>'+(filled?'<path d="M'+(x-21)+' 240h42v53q0 21-21 21t-21-21z" fill="'+color+'" opacity=".8"/>':'')+(gel?'<path d="M'+(x-19)+' 262q10-12 20-2t18-1m-38 17q10-12 20-2t18-1m-38 17q10-12 20-2t18-1" fill="none" stroke="#b9c9bf" stroke-width="3"/>':'');
 const probe=x=>'<path d="M'+x+' 143v136" stroke="#6c858e" stroke-width="7"/><rect x="'+(x-7)+'" y="270" width="14" height="26" rx="5" fill="#e7f0ea" stroke="#7d9698"/>';
 let art='',caption='',notes=[];
 if(k==='ph'){
 const flask=(x,full)=>'<path d="M'+(x-13)+' 136v75c-80 26-71 110 13 110s93-84 13-110v-75z" fill="url(#g11glass)" stroke="#7b98a2" stroke-width="3"/>'+(i>=3?full?'<path d="M'+(x-9)+' 174v40c-76 26-66 102 9 102s85-76 9-102v-40z" fill="#d6e9ed" opacity=".72"/>':'<path d="M'+(x-42)+' 286h84q-10 31-42 31t-42-31z" fill="#d6e9ed" opacity=".72"/>':'')+'<path d="M'+(x-19)+' 174h38" stroke="#a26d61" stroke-width="2"/>'+tx(x+61,178,'100 мл',12);
 art=flask(220,i>=4)+flask(520,i>=5)+tx(220,345,'HCl үлгісі')+tx(520,345,'NaOH үлгісі')+tx(370,105,'10,00 мл бастапқы үлгі → жалпы көлем 100,00 мл',16);
 caption='Белгіге дейін жеткізу · тығындап бірнеше рет аударып араластыру';
 notes=i>=2?['25 °C · pH(HCl) = '+fmt(r.acidPH)+'; pH(NaOH) = '+fmt(r.basePH),i>=5?'Соңғы концентрациялар: '+r.finalM.toFixed(4)+' М':'Бастапқы концентрациялар: 0,0100 М','pH бөлек таза үлгіде өлшенеді; өлшеуіш колбаға электрод салынбайды.']:['Калибрленген pH-метр мен таза өлшеуіш колбалар'];
 }
 if(k==='buffer'){
 art=beaker(240,undefined,i>=2)+beaker(520,undefined,i>=2)+probe(254)+probe(534)+display(158,76,'Су · pH',i>=2?fmt(r.waterPH):'—')+display(438,76,'Фосфат буфері · pH',i>=2?fmt(r.bufferPH):'—')+tx(240,345,'100 мл CO₂-сіз су')+tx(520,345,'100 мл фосфат буфері');
 caption='Қышқыл мөлшері бірдей: 0,10 мл × 0,100 М · T = 25 °C';
 notes=i>=2?['Су: pH '+fmt(r.waterPH)+' · буфер: pH '+fmt(r.bufferPH),'H₂PO₄⁻ және HPO₄²⁻: әрқайсысы 0,0100 М','Өлшемдер — идеал ерітіндіге арналған есептік модель.']:['Электродтың өлшейтін бөлігі сұйыққа батырылады.'];
 }
 if(k==='titration'){
 const v=r.volume,meniscus=120+v*5;
 art='<path d="M170 321V55M136 321h68M170 90h194" stroke="#7e9399" stroke-width="7" fill="none"/><rect x="354" y="64" width="32" height="175" rx="4" stroke="#7b98a2" fill="url(#g11glass)" stroke-width="3"/>'+(i>=1?'<path d="M358 '+meniscus+'h24v'+(230-meniscus)+'h-24z" fill="#d8e9ec" opacity=".75"/>':'')+Array.from({length:7},(_,n)=>'<path d="M358 '+(120+n*15)+'h12" stroke="#6e8b93"/>'+tx(405,124+n*15,String(n*3),10)).join('')+'<path d="M370 239v18m-12-10h24" stroke="#7b949c" stroke-width="4"/><path d="M354 267v20l-42 39q-4 6 10 6h96q14 0 10-6l-42-39v-20z" stroke="#72959d" stroke-width="3" fill="url(#g11glass)"/>'+(i>=3?'<path d="M332 311h76l14 15H318z" fill="'+(i>=5?'#e8c9d8':'#deeceb')+'"/>':'')+display(510,105,'Бюретка · NaOH',fmt(v)+' мл')+tx(370,345,'HCl + фенолфталеин');
 caption=i>=5?'Соңғы нүкте · эквиваленттік нүктеден сәл кейін':'Кран ұшы колба мойнына тимейді · менискіс көз деңгейінде оқылады';
 notes=i>=3?['c(NaOH) = 0,1000 М; V(HCl) = 10,00 мл','Бюретка: 0,00 → '+fmt(v)+' мл',i>=5?'Соңғы нүкте эквиваленттік нүктеге дәл тең емес.':'Соңында NaOH аз үлеспен қосылады.']:['Таза бюретка мен пипетка · дайын стандартты NaOH'];
 }
 if(k==='complex'){
 art='<path d="M85 324V80h590v244M85 80l40-35h510l40 35" fill="#d8e6e433" stroke="#8ca4a6" stroke-width="4"/>'+vial(220,i>=4?'#365eaa':'#8dc5dc',i>=2,i===3)+vial(430,'#8dc5dc',i>=2)+tx(220,345,'Cu²⁺ + NH₃')+tx(430,345,'Cu²⁺ + су бақылауы');
 if(i===3)art+='<path d="M201 292q19-18 38 0v10h-38z" fill="#a4cddc"/>';
 if(i>=4){const xy=[[620,172,'NH₃'],[665,220,'NH₃'],[620,268,'NH₃'],[575,220,'NH₃'],[592,189,'H₂O'],[650,251,'H₂O']];art+=xy.map(([x,y,label],n)=>'<path d="M620 220L'+x+' '+y+'" stroke="#8a9eaa" stroke-width="2" '+(n>=4?'stroke-dasharray="4 3"':'')+'/>'+tx(x,y,label,12)).join('')+'<circle cx="620" cy="220" r="16" fill="#b7cadd"/>'+tx(620,225,'Cu',13)+tx(620,306,'6 лиганд',13);}
 caption=i===3?'Аз NH₃: көгілдір Cu(OH)₂ тұнбасы':i>=4?'Артық NH₃: тұнба еріп, қою көк кешен түзілді.':'Тартпа шкаф моделі · реактивтер бөлек тамшуырмен қосылады';
 notes=['[Cu(NH₃)₄(H₂O)₂]²⁺: төрт NH₃ және екі H₂O','Координациялық сан: 6 · түс сапалық модель ретінде берілген.'];
 }
 if(k==='plating'){
 const on=i===4,after=i>=5,ax=after?200:345,cx=after?560:415;
 art=beaker(380,'#79bad4',i>=3)+'<path d="M'+ax+' 173v130" stroke="#b67c57" stroke-width="'+(i>=4?12:17)+'"/><path d="M'+cx+' 173v92" stroke="'+(i>=4?'#b67c57':'#8f9fa4')+'" stroke-width="8"/><ellipse cx="'+cx+'" cy="284" rx="15" ry="22" fill="'+(i>=4?'#b67c57':'#9caaad')+'" stroke="#6d858d"/>'+display(70,75,after?'Мыс аноды · өлшенген':'Тұрақты ток көзі',after?fmt(r.anodeG,3)+' г':on?'ҚОСУЛЫ':'ӨШІРУЛІ')+display(520,75,after?'Қасық · өлшенген':'Амперметр',after?fmt(r.spoonG,3)+' г':on?'0,10 A':'0,00 A')+tx(380,345,'CuSO₄ электролиті');
 if(!after)art+tx(345,162,'+ анод',13)+tx(424,162,'− катод',13);
 if(i>=3&&!after)art+='<path d="M180 142v12H345v19M415 173v-19h160v-12M555 75V50H140v25" stroke="#607f88" stroke-width="4" fill="none"/>';
 if(after)art+='<path d="M155 313h90m270 0h90" stroke="#b1b3a7" stroke-width="8"/>'+tx(200,345,'Мыс аноды')+tx(560,345,'Мыс қабаты бар қасық');
 caption=on?'Модельдік уақыт: 600 с · ток: 0,10 A':after?'Ток өшірілді · электродтар жуылып, кептіріліп өлшенді.':'Қасық — катод (−), мыс — анод (+)';
 notes=['Бастапқы: қасық 10,000 г; мыс 5,000 г',after?'Соңғы: қасық '+fmt(r.spoonG,3)+' г; мыс '+fmt(r.anodeG,3)+' г':'Мыс аноды иондарды толықтырады; бұл модельде газ бөлінбейді.','m = MIt/(zF) · ток шығымы 100% деп алынған'];
 }
 if(k==='silicate'){
 art=vial(240,i>=4?'#e4e9e2':'#dcebed',i>=2,i>=4)+vial(520,'#dcebed',i>=2)+tx(240,345,'Na₂SiO₃ + HCl')+tx(520,345,'Су + HCl бақылауы');
 caption=i>=4?'Гель — гидратталған SiO₂ · бақылау үлгісі сұйық күйде':'Бөлек тамшуырлар · реактив қосқаннан кейін бақылау';
 notes=['H₂SiO₃ — мектептік шартты жазылуы','Гель түзілуі — сапалық оқу моделі.'];
 }
 const phase=task?'Әрекет орындалуда':s.index?l.steps[s.index-1].label:'Құралдарды үстелге орналастырыңыз';
 return '<div class="cg-visual '+(s.runningSince===null?'paused':'')+'"><svg viewBox="0 0 760 400" role="img" aria-label="'+esc(l.title+' · '+phase)+'"><defs><linearGradient id="g11glass"><stop stop-color="#c9dfe444"/><stop offset=".2" stop-color="#ffffffbb"/><stop offset=".8" stop-color="#bfd7dd33"/><stop offset="1" stop-color="#ffffff99"/></linearGradient><linearGradient id="g11wall" x2="0" y2="1"><stop stop-color="#e6eeeb"/><stop offset="1" stop-color="#cadbd6"/></linearGradient></defs><rect width="760" height="400" fill="url(#g11wall)"/><path d="M0 348h760v52H0z" fill="#456965"/><path d="M0 349h760" stroke="#a3bcb2" stroke-width="4"/>'+(ready?art:'<rect x="180" y="125" width="400" height="170" rx="14" fill="#ffffff44" stroke="#92aaa8" stroke-dasharray="8 6"/>'+tx(380,190,'Тәжірибе құралдарын орналастырыңыз',17)+tx(380,238,s.tools.length+' / '+l.tools.length+' құрал',16))+tx(380,378,ready?caption:'Үстел дайын болғанда қадамдарды бастаңыз.',13,'#fff')+'</svg></div><p class="cg-scene-caption">'+esc(phase)+'</p>'+(ready?'<aside class="cg-readings" aria-label="Құрал көрсеткіштері"><strong>Оқу моделінің көрсеткіштері</strong>'+notes.map(n=>'<p>'+esc(n)+'</p>').join('')+'</aside>':'')+(done?'<p class="school-equation">'+esc(l.equation)+'</p>':'');
}
