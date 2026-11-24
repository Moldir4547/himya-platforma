const symbols='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const names='Сутек|Гелий|Литий|Бериллий|Бор|Көміртек|Азот|Оттек|Фтор|Неон|Натрий|Магний|Алюминий|Кремний|Фосфор|Күкірт|Хлор|Аргон|Калий|Кальций|Скандий|Титан|Ванадий|Хром|Марганец|Темір|Кобальт|Никель|Мыс|Мырыш|Галлий|Германий|Мышьяк|Селен|Бром|Криптон|Рубидий|Стронций|Иттрий|Цирконий|Ниобий|Молибден|Технеций|Рутений|Родий|Палладий|Күміс|Кадмий|Индий|Қалайы|Сурьма|Теллур|Йод|Ксенон|Цезий|Барий|Лантан|Церий|Празеодим|Неодим|Прометий|Самарий|Еуропий|Гадолиний|Тербий|Диспрозий|Гольмий|Эрбий|Тулий|Иттербий|Лютеций|Гафний|Тантал|Вольфрам|Рений|Осмий|Иридий|Платина|Алтын|Сынап|Таллий|Қорғасын|Висмут|Полоний|Астат|Радон|Франций|Радий|Актиний|Торий|Протактиний|Уран|Нептуний|Плутоний|Америций|Кюрий|Берклий|Калифорний|Эйнштейний|Фермий|Менделевий|Нобелий|Лоуренсий|Резерфордий|Дубний|Сиборгий|Борий|Хассий|Мейтнерий|Дармштадтий|Рентгений|Коперниций|Нихоний|Флеровий|Московий|Ливерморий|Теннессин|Оганесон'.split('|');
const rows=[
 [1,...Array(16).fill(0),2],
 [3,4,...Array(10).fill(0),5,6,7,8,9,10],
 [11,12,...Array(10).fill(0),13,14,15,16,17,18],
 Array.from({length:18},(_,i)=>i+19),
 Array.from({length:18},(_,i)=>i+37),
 [55,56,'57–71',...Array.from({length:15},(_,i)=>i+72)],
 [87,88,'89–103',...Array.from({length:15},(_,i)=>i+104)]
];
export const TABLE=rows.map((r,p)=>({label:String(p+1),cells:r}));
TABLE.push({label:'La–Lu',cells:[0,0,0,...Array.from({length:15},(_,i)=>i+57)]},{label:'Ac–Lr',cells:[0,0,0,...Array.from({length:15},(_,i)=>i+89)]});
export const SYMBOLS=symbols;
export const DEMOS=[8,26];
const orbitalOrder=['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p'];
const capacity={s:2,p:6,d:10};
const corrections={
 24:{'4s':1,'3d':5},29:{'4s':1,'3d':10},
 41:{'5s':1,'4d':4},42:{'5s':1,'4d':5},44:{'5s':1,'4d':7},
 45:{'5s':1,'4d':8},46:{'5s':0,'4d':10},47:{'5s':1,'4d':10}
};
// Occupancies beyond Xe and Rn, following the PubChem reference convention.
const period6=[
 [0,0,1],[0,0,2],[0,1,2],[1,1,2],
 ...[3,4,5,6,7].map(f=>[f,0,2]),[7,1,2],
 ...[9,10,11,12,13,14].map(f=>[f,0,2]),[14,1,2],
 ...[2,3,4,5,6,7].map(d=>[14,d,2]),[14,9,1],[14,10,1],[14,10,2],
 ...[1,2,3,4,5,6].map(p=>[14,10,2,p])
];
const period7=[
 [0,0,1],[0,0,2],[0,1,2],[0,2,2],[2,1,2],[3,1,2],[4,1,2],
 [6,0,2],[7,0,2],[7,1,2],...[9,10,11,12,13,14].map(f=>[f,0,2]),
 [14,0,2,1],...[2,3,4,5,6,7,8].map(d=>[14,d,2]),[14,10,1],[14,10,2],
 ...[1,2,3,4,5,6].map(p=>[14,10,2,p])
];
function extend(core,orbitals,counts){
 return core.concat(counts.flatMap((count,i)=>count?[{orbital:orbitals[i],n:Number(orbitals[i][0]),count}]:[]));
}
const supers='⁰¹²³⁴⁵⁶⁷⁸⁹';
export const superscript=n=>String(n).replace(/\d/g,d=>supers[Number(d)]);
const light=Array.from({length:54},(_,i)=>{
 const z=i+1,period=rows.findIndex(r=>r.includes(z))+1;
 let left=z;
 const terms=orbitalOrder.map(o=>{
  const count=Math.min(left,capacity[o[1]]);left-=count;
  return {orbital:o,n:Number(o[0]),count:corrections[z]?.[o]??count};
 }).filter(t=>t.count).sort((a,b)=>a.n-b.n||'spd'.indexOf(a.orbital[1])-'spd'.indexOf(b.orbital[1]));
 const shells=Array(period).fill(0);terms.forEach(t=>{shells[t.n-1]+=t.count;});
 return {z,period,symbol:symbols[i],name:names[i],terms,shells};
});
const xe=light.at(-1).terms, orbitals6=['4f','5d','6s','6p'], orbitals7=['5f','6d','7s','7p'];
const rn=extend(xe,orbitals6,period6.at(-1));
export const ELEMENTS=light.concat([...period6,...period7].map((counts,i)=>{
 const z=55+i,period=z<=86?6:7;
 const terms=period===6?extend(xe,orbitals6,counts):extend(rn,orbitals7,counts);
 const shells=Array(period).fill(0);terms.forEach(t=>{shells[t.n-1]+=t.count;});
 return {z,period,symbol:symbols[z-1],name:names[z-1],terms,shells};
}));
export const PRACTICE=ELEMENTS;
export const evaluate=(element,values)=>{
 if(values.length!==element.period||!values.every(v=>/^\d{1,2}$/.test(v.trim())))return null;
 return values.map(Number).map((v,i)=>v===element.shells[i]);
};

export function evaluateConfiguration(element, input){
 const value=input.toLowerCase().replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g,d=>String(supers.indexOf(d))).replace(/\s/g,'');
 if(!value)return null;
 const tokens=/([1-7][spdf])\^?([1-9]\d?)(?=[1-7][spdf]|$)/gy, entered=new Map();
 let i=0;
 while(i<value.length){
  const term=tokens.exec(value);
  if(!term||entered.has(term[1]))return null;
  entered.set(term[1],Number(term[2]));
  i=tokens.lastIndex;
 }
 return entered.size===element.terms.length&&element.terms.every(t=>entered.get(t.orbital)===t.count);
}
