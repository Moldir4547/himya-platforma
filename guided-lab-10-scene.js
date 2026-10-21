
const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function scene10(l,s,task){
 const i=Math.min(l.steps.length,s.index+(task?1:0)),ready=l.tools.every(t=>s.tools.includes(t)),done=i===l.steps.length,k=l.kind;
 const text=(x,y,t,size=14,color='#244b54')=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+size+'" fill="'+color+'">'+esc(t)+'</text>';
 const bubbles=(x,y,n)=>Array.from({length:n},(_,j)=>'<circle class="cg-bubble" cx="'+(x+(j*19)%42-21)+'" cy="'+(y-j%4*15)+'" r="'+(3+j%2)+'" stroke="#ffffff" stroke-width="2" fill="none" style="--delay:'+j*.16+'s"/>').join('');
 const beaker=(x,y,color='#d9e9e9',level=65)=>'<g><path d="M'+(x-49)+' '+y+'v114q0 15 49 15t49-15V'+y+'" fill="url(#g10glass)" stroke="#76949c" stroke-width="3"/><path d="M'+(x-45)+' '+(y+129-level)+'h90v'+(level-14)+'q0 11-45 11t-45-11z" fill="'+color+'" opacity=".72"/><ellipse cx="'+x+'" cy="'+(y+129-level)+'" rx="45" ry="5" fill="'+color+'" opacity=".65"/><path d="M'+(x-35)+' '+(y+8)+'v95" stroke="white" stroke-width="4" opacity=".6"/>'+[0,1,2,3].map(n=>'<path d="M'+(x+29)+' '+(y+23+n*20)+'h15" stroke="#71949b"/>').join('')+'</g>';
 const vial=(x,color,deposit='')=>'<path d="M'+(x-25)+' 160v131q0 25 25 25t25-25V160" stroke="#7a98a0" stroke-width="3" fill="url(#g10glass)"/><path d="M'+(x-21)+' 235h42v55q0 21-21 21t-21-21z" fill="'+color+'" opacity=".8"/>'+(deposit?'<path d="M'+(x-19)+' 291q20-17 38 0v8q-19 20-38 0z" fill="'+deposit+'"/>':'');
 const syringe=(x,y,volume,max=50)=>{const px=150*volume/max;return '<path d="M'+(x-30)+' '+(y+21)+'h30" stroke="#7897a2" stroke-width="8"/><rect x="'+x+'" y="'+y+'" width="160" height="42" rx="3" fill="url(#g10glass)" stroke="#688791" stroke-width="3"/><path d="M'+(x+px+4)+' '+(y-4)+'v50m0-25h'+(180-px)+'m0-10v20" stroke="#879da2" stroke-width="7" fill="none"/>'+Array.from({length:6},(_,n)=>'<path d="M'+(x+5+n*30)+' '+(y+3)+'v10" stroke="#4e727c"/>'+text(x+5+n*30,y-6,String(n*10),10)).join('')+text(x+80,y+66,volume.toFixed(1)+' мл',16);};
 const flask=(x,gas=0,filled=false)=>'<path d="M'+(x-18)+' 195v35l-52 80q-5 10 13 10h114q18 0 13-10l-52-80v-35z" stroke="#6f939c" stroke-width="3" fill="url(#g10glass)"/>'+(filled?'<path d="M'+(x-47)+' 287h94l16 23h-126z" fill="#d7e7e9"/>':'')+bubbles(x,302,gas);
 const thermometer=(x,y,t)=>'<rect x="'+(x-11)+'" y="'+y+'" width="22" height="121" rx="10" fill="#f8fbfb" stroke="#78949b" stroke-width="2"/><path d="M'+x+' '+(y+106)+'v-'+Math.max(6,35+(t-20)*3)+'" stroke="#bd6c5d" stroke-width="5"/><circle cx="'+x+'" cy="'+(y+105)+'" r="8" fill="#bd6c5d"/>'+text(x,y-12,t.toFixed(1)+' °C',17);
 const device=(x,y,label,value)=>'<rect x="'+x+'" y="'+y+'" width="160" height="67" rx="9" fill="#304b56"/><rect x="'+(x+11)+'" y="'+(y+10)+'" width="138" height="32" rx="4" fill="#d5e5cd"/>'+text(x+80,y+33,value,21)+text(x+80,y+57,label,11,'#eef5f4');
 let art='',caption='',readings=[];
 if(k==='gas'){
 const v=i>=5?24:i>=4?14:0;
 art=flask(230,i===4?8:0,i>=4)+'<path d="M212 196h36" stroke="#9a8775" stroke-width="13"/><path d="M230 195V131H410" stroke="#8ea8ae" stroke-width="7" fill="none"/>'+syringe(440,110,v)+'<path d="M615 320V78M595 320h45M615 175h-95v-23M600 175v-23" stroke="#788d92" stroke-width="6" fill="none"/>'+text(230,344,'Mg + сұйылтылған HCl')+text(520,344,'Газ шприці · H₂')+device(40,70,'Таразы',i>=2?'0,0243 г':'—');
 if(i>=2&&i<4)art+='<rect x="219" y="272" width="22" height="30" rx="4" fill="#9fa7a8"/>';
 caption=i>=5?'25 °C · 101,3 кПа · шприц деңгейінде оқу':'Поршень еркін қозғалады; газ жолы бітелмейді.';
 readings=i>=5?['m(Mg) = 0,0243 г','V(H₂) = 24,0 мл','T = 298,15 K; p = 101,3 кПа']:['Шприцтің бастапқы көлемі: 0,0 мл'];
 }
 if(k==='calorimetry'){
 const t=i>=5?26.8:20;
 art='<path d="M290 175l17 146h145l18-146z" fill="#f5f1e4" stroke="#a9aca1" stroke-width="5"/><path d="M308 241h145l-8 70H316z" fill="#d9e9e7"/><rect x="280" y="162" width="200" height="16" rx="6" fill="#c7ccbf"/><path d="M420 150v139" stroke="#9caaac" stroke-width="5"/>'+thermometer(355,175,t)+text(382,344,'Оқшауланған стақан · 100 мл')+beaker(150,195)+text(150,344,'50,0 мл HCl')+beaker(610,195)+text(610,344,'50,0 мл NaOH');
 caption='Қақпақтағы датчик және араластырғыш · герметикалық емес';
 readings=i>=5?['T₀ = 20,0 °C; Tmax = 26,8 °C','m = 100 г; c = 4,18 Дж/(г·°C)','Екі ерітінді: 1,00 М, әрқайсысы 50,0 мл']:['Екі ерітіндінің бастапқы температурасы: 20,0 °C'];
 }
 if(k==='dissolution'){
 art=beaker(240,185,'#dae7e8')+beaker(520,185,'#dae7e8')+thermometer(260,175,i>=3?16.8:20)+thermometer(540,175,i>=4?28.3:20)+text(240,344,'5,00 г NH₄Cl + 100 г су')+text(520,344,'5,00 г CaCl₂ + 100 г су');
 caption='Жылу әсері мен өздігінен жүруді бөлек түсіндіріңіз.';
 readings=i>=5?['Бастапқы T: 20,0 °C','NH₄Cl: 16,8 °C; сусыз CaCl₂: 28,3 °C','Температуралар — жуық модельдік деректер']:['Су үлгілерінің массасы мен бастапқы температурасы бірдей'];
 }
 if(k==='kinetics'){
 const v1=i>=5?24.5:i>=4?8:i>=3?3:0,v2=i>=5?24.5:i>=4?18:i>=3?7:0;
 art='<path d="M330 320V78M310 320h40M330 175H220v-23M300 175v-23M660 320V78M640 320h40M660 175H550v-23M630 175v-23" stroke="#788d92" stroke-width="6" fill="none"/>'+flask(195,i>=3&&i<5?3:0,i>=3)+flask(525,i>=3&&i<5?9:0,i>=3)+'<path d="M177 196h36M507 196h36" stroke="#9a8775" stroke-width="13"/>'+'<path d="M195 195V144H85V131H115M525 195V144H415V131H445" stroke="#8ea8ae" stroke-width="6" fill="none"/>'+syringe(145,110,v1)+syringe(475,110,v2)+text(195,344,'0,50 М HCl')+text(525,344,'1,00 М HCl');
 caption='Mg массасы, HCl көлемі және температура бірдей.';
 readings=i>=5?['Соңғы көлемдер: 24,5 мл және 24,5 мл','Екі үлгіде де HCl артық']:i>=4?['Бірдей модельдік уақыт: 8,0 мл / 18,0 мл','Аралық көлемдер сапалық салыстыруға арналған']:['Газ шприцтері бастапқыда 0,0 мл'];
 }
 if(k==='equilibrium'){
 art=[200,380,560].map((x,n)=>vial(x,i>=3&&n===0||i>=4&&n===1?'#a84a38':i>=5&&n===2?'#e3ad88':'#c57d59')+text(x,344,['+ Fe³⁺','+ SCN⁻','+ сондай көлем су'][n])).join('');
 caption='Бірдей температура · K тұрақты, қосқан сәтте Q өзгереді.';
 readings=['K = [FeSCN²⁺] / ([Fe³⁺][SCN⁻])','Бұл модель K сандық мәнін өлшемейді'];
 }
 if(k==='titration'){
 const v=i>=6?10.05:i>=5?9.8:0,level=120+v*5;
 art='<path d="M170 317V55M135 321h73M170 91h195" stroke="#7e9298" stroke-width="7" fill="none"/><rect x="354" y="64" width="32" height="175" rx="4" fill="url(#g10glass)" stroke="#718e98" stroke-width="3"/><path d="M358 '+level+'h24v'+(230-level)+'h-24z" fill="#795780" opacity=".72"/>'+Array.from({length:7},(_,n)=>'<path d="M359 '+(120+n*15)+'h12" stroke="#526f78"/>'+text(403,124+n*15,String(n*3),10)).join('')+'<path d="M370 239v18m-12-10h24" stroke="#7e959b" stroke-width="4"/>'+ '<path d="M354 267v20l-42 39q-4 6 10 6h96q14 0 10-6l-42-39v-20z" stroke="#6f939c" stroke-width="3" fill="url(#g10glass)"/>'+(i>=3?'<path d="M332 311h76l14 15H318z" fill="'+(i>=6?'#eacbd7':'#e6e8d5')+'"/>':'')+device(505,100,'Бюретка, жұмсалған көлем',v.toFixed(2)+' мл')+text(370,344,'Қышқылданған Fe²⁺ үлгісі');
 if(task&&i>=5)art+='<path d="M370 258q-5 8 0 9t0-9" fill="#795780"/>';
 caption=i>=6?'Соңғы белгі: тұрақты бозғылт қызғылт түс':'Бюретканың менискісін көз деңгейінде оқыңыз.';
 readings=['c(KMnO₄) = 0,0200 М; V(Fe²⁺) = 10,00 мл',i>=6?'Бюретка: 0,00 → 10,05 мл':'MnO₄⁻ : Fe²⁺ = 1 : 5'];
 }
 if(k==='galvanic'){
 const connected=i>=4&&i<6;
 art=beaker(215,185)+beaker(545,185,'#76b9d1')+'<path d="M215 167v129" stroke="#9fa9aa" stroke-width="22"/><path d="M545 167v129" stroke="#b67b56" stroke-width="22"/>'+text(215,344,'Zn · анод (−)')+text(545,344,'Cu · катод (+)')+device(300,58,'Вольтметр',connected?'1,10 V':'—');
 if(i>=3)art+='<path d="M244 270V157Q244 142 260 142H500Q516 142 516 157V270" stroke="#b2c5b8" stroke-width="16" fill="none"/><path d="M244 270V157Q244 142 260 142H500Q516 142 516 157V270" stroke="#e4eadf" stroke-width="8" fill="none"/>'+text(380,134,'KNO₃ тұз көпірі',13);
 if(connected)art+='<path d="M215 168V95H300M460 95H545V168" stroke="#5c747e" stroke-width="4" fill="none"/><path d="M235 78h46l-7-5m7 5-7 5M478 78h46l-7-5m7 5-7 5" stroke="#c2944d" stroke-width="3" fill="none"/>'+text(256,61,'e⁻ →',13)+text(501,61,'e⁻ →',13);
 caption='Электрон: Zn → сым → Cu · көпірде: NO₃⁻ солға, K⁺ оңға.';
 readings=['Zn → Zn²⁺ + 2e⁻','Cu²⁺ + 2e⁻ → Cu',connected?'25 °C, стандартқа жуық оқу көрсеткіші: 1,10 V':i>=6?'Тіркелген кернеу: 1,10 V; тізбек ажыратылды.':'Сыртқы тізбек ажыратылған'];
 }
 if(k==='electrolysis'){
 const on=i===4,after=i>=5;
 art=beaker(380,174,'#68b6d2',88)+'<path d="M345 167v126" stroke="#b97b55" stroke-width="'+(i>=4?12:18)+'"/><path d="M415 167v126" stroke="#b97b55" stroke-width="'+(i>=4?24:18)+'"/>'+device(70,79,'Тұрақты ток көзі',on?'ҚОСУЛЫ':'ӨШІРУЛІ')+device(520,79,'Амперметр',on?'0,20 A':'0,00 A')+'<path d="M180 146v16H345V167M415 167v-5h160v-16M555 79V55H140V79" stroke="#597682" stroke-width="4" fill="none"/>'+text(345,155,'+ анод',13)+text(425,155,'− катод',13)+text(380,344,'CuSO₄ · екі мыс электрод');
 caption=on?'Модельдік электролиз уақыты: 600 с (жеделдетілген)':'Өлшер алдында токты өшіріп, электродты жуып кептіреді.';
 readings=after?['Катод: 5,000 → 5,040 г','Анод: 5,000 → 4,960 г','I = 0,20 A; t = 600 с; 100% ток шығымы моделі']:['Бастапқы массалар: 5,000 г және 5,000 г','Мыс аноды ериді; газ көпіршіктері жоқ'];
 }
 if(k==='chromatography'){
 const front=i>=6?100:i>=5?160:302;
 art='<rect x="236" y="75" width="288" height="246" rx="10" fill="url(#g10glass)" stroke="#78959c" stroke-width="3"/><path d="M240 302h280v15H240z" fill="#d1e6eb"/><path d="M228 73h304" stroke="#a1aaa1" stroke-width="12"/><rect x="330" y="94" width="100" height="221" fill="#faf8ed" stroke="#ccc9bb"/><path data-solvent-surface d="M240 302h280" stroke="#8fb3c1"/><path data-baseline d="M330 280h100" stroke="#868c83" stroke-dasharray="5 3"/>'+text(535,284,'Бастапқы сызық',12)+text(540,316,'Еріткіш деңгейі',12);
 if(i>=5)art+='<rect x="332" y="'+front+'" width="96" height="'+(310-front)+'" fill="#d8e8e033"/><path data-solvent-front d="M332 '+front+'h96" stroke="#76a2aa" stroke-dasharray="3 3"/>'+text(540,front+5,'Фронт',12);
 if(i>=5)art+=[['#bc737e',226],['#cdb654',172],['#5996bc',136]].map(([c,y],n)=>'<ellipse cx="380" cy="'+(i>=6?y:280-(280-y)*.5)+'" rx="16" ry="7" fill="'+c+'" opacity=".75"/>').join('');else if(i>=3)art+='<ellipse cx="380" cy="280" rx="10" ry="4" fill="#675e87"/>';
 art+=text(380,344,'Қағаз жолағы · дақ сұйыққа батпайды');
 caption='Қашықтықтар қағаз шетінен емес, бастапқы сызықтан өлшенеді.';
 readings=i>=7?['Фронт: 80 мм','Дақтар: 24 мм; 48 мм; 64 мм','Rf мәндерін журналға өзіңіз есептеп жазыңыз']:['Еріткіш деңгейі бастапқы дақтан төмен'];
 }
 if(k==='halogens'){
 art='<path d="M95 319V73h570v246M95 73l42-34h486l42 34" fill="#d1e0e033" stroke="#7d959a" stroke-width="4"/>'+[210,380,550].map((x,n)=>vial(x,i>=3&&i<6?['#e3e9cc','#d9b57e','#b28c62'][n]:'#e2eced')+text(x,344,['KCl','KBr','KI'][n])).join('');
 caption=i>=6?'Қалдықтағы галоген тотықсыздандырылды.':'Тартпа шкаф · тек сулы орта · газ өндірілмейді.';
 readings=i>=3&&i<6?['Бром суы: сарғыш-қызғылт','Иодтың сулы ерітіндісі: қоңыр','Cl⁻ — осы сынақтағы бақылау']:['Қалған галоген мұғалімнің қалдық өңдеу сатысында алынады'];
 }
 if(k==='softening'){
 art=beaker(215,185)+beaker(545,185);
 if(i>=2)art+='<path d="M175 294q40-13 80 0v7h-80" fill="#e8e5da"/>';
 if(i>=5)art+='<path d="M501 246q9-23 18-4 10-23 20-5 11-23 20-1 11-23 25 2v14h-83z" fill="#fbfdf9" stroke="#c7d8d8"/>';
 if(i===3)art+='<path d="M506 292q40-12 78 0v8h-78z" fill="#edece2"/>';
 if(i>=4)art+='<path d="M493 133h104l-46 50v20h-12v-20z" stroke="#839da3" stroke-width="3" fill="#f5f3e8"/><path d="M510 142h70l-35 33z" fill="#ebe9df"/><circle cx="545" cy="215" r="4" fill="#94bac7"/>'+text(545,120,'Сүзгіде CaCO₃',13);
 art+=text(215,344,'Бақылау: кермек су + сабын')+text(545,344,'Тұндыру → сүзу → сабын');
 caption='CaCl₂-ден алынған кермектік · Na₂CO₃ есептелген мөлшерде';
 readings=['Ca²⁺ + CO₃²⁻ → CaCO₃↓',i>=5?'Сүзіндіде бірдей сабын мөлшерімен көбіктену артады.':'Екі бастапқы үлгінің көлемі бірдей'];
 }
 const phase=task?'Әрекет орындалуда':s.index?l.steps[s.index-1].label:'Құралдарды үстелге орналастырыңыз';
 return '<div class="cg-visual '+(s.runningSince===null?'paused':'')+'"><svg viewBox="0 0 760 400" role="img" aria-label="'+esc(l.title+' · '+phase)+'"><defs><linearGradient id="g10glass"><stop stop-color="#c7dce340"/><stop offset=".2" stop-color="#ffffffbb"/><stop offset=".7" stop-color="#c2dbe42f"/><stop offset="1" stop-color="#ffffff99"/></linearGradient><linearGradient id="g10wall" x2="0" y2="1"><stop stop-color="#e7efed"/><stop offset="1" stop-color="#cedddb"/></linearGradient></defs><rect width="760" height="400" fill="url(#g10wall)"/><path d="M0 348h760v52H0z" fill="#4c6866"/><path d="M0 349h760" stroke="#a1b8af" stroke-width="5"/>'+(ready?art:'<rect x="195" y="115" width="370" height="190" rx="14" fill="#ffffff44" stroke="#8fa9ab" stroke-dasharray="8 6"/>'+text(380,196,'Құралдар мен реактивтерді орналастырыңыз',17)+text(380,236,s.tools.length+' / '+l.tools.length+' құрал',16))+text(380,380,ready?caption:'Тәжірибе үстелі әлі дайын емес',13,'#fff')+'</svg></div><p class="cg-scene-caption">'+esc(phase)+'</p>'+(ready?'<aside class="cg-readings" aria-label="Құрал көрсеткіштері"><strong>Модельдік көрсеткіштер</strong>'+readings.map(r=>'<p>'+esc(r)+'</p>').join('')+'</aside>':'')+(done?'<p class="school-equation">'+esc(l.equation)+'</p>':'');
}
