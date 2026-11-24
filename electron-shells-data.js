const symbols='H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
const names='Сутек|Гелий|Литий|Бериллий|Бор|Көміртек|Азот|Оттек|Фтор|Неон|Натрий|Магний|Алюминий|Кремний|Фосфор|Күкірт|Хлор|Аргон|Калий|Кальций|Скандий|Титан|Ванадий|Хром|Марганец|Темір|Кобальт|Никель|Мыс|Мырыш|Галлий|Германий|Мышьяк|Селен|Бром|Криптон|Рубидий|Стронций|Иттрий|Цирконий|Ниобий|Молибден|Технеций|Рутений|Родий|Палладий|Күміс|Кадмий|Индий|Қалайы|Сурьма|Теллур|Йод|Ксенон'.split('|');
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
export const DEMOS=[8,20,26,46];
const orbitalOrder=['1s','2s','2p','3s','3p','4s','3d','4p','5s','4d','5p'];
const capacity={s:2,p:6,d:10};
const corrections={
 24:{'4s':1,'3d':5},29:{'4s':1,'3d':10},
 41:{'5s':1,'4d':4},42:{'5s':1,'4d':5},44:{'5s':1,'4d':7},
 45:{'5s':1,'4d':8},46:{'5s':0,'4d':10},47:{'5s':1,'4d':10}
};
const supers='⁰¹²³⁴⁵⁶⁷⁸⁹';
export const superscript=n=>String(n).replace(/\d/g,d=>supers[Number(d)]);
export const ELEMENTS=Array.from({length:54},(_,i)=>{
 const z=i+1,period=rows.findIndex(r=>r.includes(z))+1;
 let left=z;
 const terms=orbitalOrder.map(o=>{
  const count=Math.min(left,capacity[o[1]]);left-=count;
  return {orbital:o,n:Number(o[0]),count:corrections[z]?.[o]??count};
 }).filter(t=>t.count).sort((a,b)=>a.n-b.n||'spd'.indexOf(a.orbital[1])-'spd'.indexOf(b.orbital[1]));
 const shells=Array(period).fill(0);terms.forEach(t=>{shells[t.n-1]+=t.count;});
 return {z,period,symbol:symbols[i],name:names[i],terms,shells};
});
export const PRACTICE=ELEMENTS.filter(e=>!DEMOS.includes(e.z));
export const evaluate=(element,values)=>{
 if(values.length!==element.period||!values.every(v=>/^\d{1,2}$/.test(v.trim())))return null;
 return values.map(Number).map((v,i)=>v===element.shells[i]);
};
