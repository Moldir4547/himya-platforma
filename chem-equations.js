const sub='₀₁₂₃₄₅₆₇₈₉';
const format=s=>s.replace(/\d/g,d=>sub[d]);
const bank=s=>s.trim().split('\n').map(line=>{
 const [eq,coef]=line.split('|');
 return [format(eq),[...coef.trim().split(/\s+/)].map(Number)];
});
export const EQUATIONS={
 7:{easy:bank(`
H2 + Cl2 → HCl|1 1 2
Na + Cl2 → NaCl|2 1 2
Mg + O2 → MgO|2 1 2
Ca + O2 → CaO|2 1 2
Al + O2 → Al2O3|4 3 2
K + Br2 → KBr|2 1 2
Li + O2 → Li2O|4 1 2
HgO → Hg + O2|2 2 1`),hard:bank(`
P4 + O2 → P4O10|1 5 1
Fe + S8 → FeS|8 1 8
H2 + N2 → NH3|3 1 2
KClO3 → KCl + O2|2 2 3
Na + H2O → NaOH + H2|2 2 2 1
SO2 + O2 → SO3|2 1 2
H2S + O2 → SO2 + H2O|2 3 2 2
C2H4 + O2 → CO2 + H2O|1 3 2 2`)},
 8:{easy:bank(`
H2 + O2 → H2O|2 1 2
Fe + O2 → Fe2O3|4 3 2
Zn + HCl → ZnCl2 + H2|1 2 1 1
Na2O + H2O → NaOH|1 1 2
Mg + HCl → MgCl2 + H2|1 2 1 1
CH4 + O2 → CO2 + H2O|1 2 1 2
H2O2 → H2O + O2|2 2 1
Al + Cl2 → AlCl3|2 3 2`),hard:bank(`
Fe + O2 → Fe3O4|3 2 1
Al + HCl → AlCl3 + H2|2 6 2 3
C3H8 + O2 → CO2 + H2O|1 5 3 4
C4H10 + O2 → CO2 + H2O|2 13 8 10
Na2CO3 + HCl → NaCl + H2O + CO2|1 2 2 1 1
Ca + H2O → Ca(OH)2 + H2|1 2 1 1
Fe2O3 + CO → Fe + CO2|1 3 2 3
NH3 + O2 → NO + H2O|4 5 4 6`)},
 9:{easy:bank(`
BaCl2 + Na2SO4 → BaSO4 + NaCl|1 1 1 2
AlCl3 + NaOH → Al(OH)3 + NaCl|1 3 1 3
FeCl3 + KOH → Fe(OH)3 + KCl|1 3 1 3
H2SO4 + KOH → K2SO4 + H2O|1 2 1 2
Ca(OH)2 + HNO3 → Ca(NO3)2 + H2O|1 2 1 2
AgNO3 + CaCl2 → AgCl + Ca(NO3)2|2 1 2 1
CuSO4 + NaOH → Cu(OH)2 + Na2SO4|1 2 1 1
Na3PO4 + CaCl2 → Ca3(PO4)2 + NaCl|2 3 1 6`),hard:bank(`
Al2(SO4)3 + BaCl2 → BaSO4 + AlCl3|1 3 3 2
Fe2(SO4)3 + NaOH → Fe(OH)3 + Na2SO4|1 6 2 3
Ca3(PO4)2 + HCl → CaCl2 + H3PO4|1 6 3 2
Al(OH)3 + H2SO4 → Al2(SO4)3 + H2O|2 3 1 6
(NH4)2CO3 + HCl → NH4Cl + H2O + CO2|1 2 2 1 1
FeS2 + O2 → Fe2O3 + SO2|4 11 2 8
H3PO4 + Ba(OH)2 → Ba3(PO4)2 + H2O|2 3 1 6
Fe2O3 + H2SO4 → Fe2(SO4)3 + H2O|1 3 1 3`)},
 10:{easy:bank(`
CuO + NH3 → Cu + N2 + H2O|3 2 3 1 3
MnO2 + HCl → MnCl2 + Cl2 + H2O|1 4 1 1 2
Cu + HNO3 → Cu(NO3)2 + NO2 + H2O|1 4 1 2 2
Fe2O3 + Al → Al2O3 + Fe|1 2 1 2
KClO3 + HCl → KCl + Cl2 + H2O|1 6 1 3 3
Na2SO3 + O2 → Na2SO4|2 1 2
C + H2SO4 → CO2 + SO2 + H2O|1 2 1 2 2
KI + Cl2 → KCl + I2|2 1 2 1`),hard:bank(`
KMnO4 + HCl → KCl + MnCl2 + Cl2 + H2O|2 16 2 2 5 8
K2Cr2O7 + HCl → KCl + CrCl3 + Cl2 + H2O|1 14 2 2 3 7
Cu + HNO3 → Cu(NO3)2 + NO + H2O|3 8 3 2 4
P4 + NaOH + H2O → PH3 + NaH2PO2|1 3 3 1 3
KMnO4 + H2O2 + H2SO4 → K2SO4 + MnSO4 + O2 + H2O|2 5 3 1 2 5 8
SO2 + H2S → S + H2O|1 2 3 2
KClO3 + KI + H2SO4 → KCl + I2 + K2SO4 + H2O|1 6 3 1 3 3 3
K2Cr2O7 + FeSO4 + H2SO4 → K2SO4 + Cr2(SO4)3 + Fe2(SO4)3 + H2O|1 6 7 1 1 3 7`)},
 11:{easy:bank(`
C6H12O6 + O2 → CO2 + H2O|1 6 6 6
C2H5OH + O2 → CO2 + H2O|1 3 2 3
C6H6 + O2 → CO2 + H2O|2 15 12 6
C3H7OH + O2 → CO2 + H2O|2 9 6 8
C12H22O11 + O2 → CO2 + H2O|1 12 12 11
Zn + NaOH + H2O → Na2Zn(OH)4 + H2|1 2 2 1 1
Al + NaOH + H2O → NaAl(OH)4 + H2|2 2 6 2 3
Fe3O4 + HCl → FeCl2 + FeCl3 + H2O|1 8 1 2 4`),hard:bank(`
KMnO4 + Na2SO3 + H2SO4 → MnSO4 + Na2SO4 + K2SO4 + H2O|2 5 3 2 5 1 3
K2Cr2O7 + C2H5OH + H2SO4 → Cr2(SO4)3 + CH3COOH + K2SO4 + H2O|2 3 8 2 3 2 11
KMnO4 + H2C2O4 + H2SO4 → MnSO4 + CO2 + K2SO4 + H2O|2 5 3 2 10 1 8
Na2S2O3 + I2 → Na2S4O6 + NaI|2 1 1 2
K2Cr2O7 + KI + H2SO4 → Cr2(SO4)3 + I2 + K2SO4 + H2O|1 6 7 1 3 4 7
KMnO4 + MnSO4 + H2O → MnO2 + K2SO4 + H2SO4|2 3 2 5 1 2
NaNO2 + KMnO4 + H2SO4 → NaNO3 + MnSO4 + K2SO4 + H2O|5 2 3 5 2 1 3
C7H6O2 + O2 → CO2 + H2O|2 15 14 6`)}
};
export function formulaAtoms(formula){
 const stack=[new Map()],patterns=/([A-Z][a-z]?|\(|\))([₀-₉]*)/gy;
 while(patterns.lastIndex<formula.length){
  const match=patterns.exec(formula);
  if(!match)throw Error('Unknown formula: '+formula);
  const [,token,num]=match,n=Number([...num].map(d=>sub.indexOf(d)).join('')||1);
  if(token==='('){stack.push(new Map());continue;}
  const entries=token===')'?stack.pop():[[token,1]],target=stack.at(-1);
  if(!target)throw Error('Unmatched bracket: '+formula);
  for(const [e,k] of entries)target.set(e,(target.get(e)||0)+n*k);
 }
 if(stack.length!==1)throw Error('Unclosed bracket: '+formula);
 return stack[0];
}
export function balanceRows(equation,coeffs){
 let i=0;
 const sums=equation.split('→').map(side=>{
  const counts=new Map();
  for(const compound of side.split('+')){
   const k=coeffs[i++];
   for(const [e,n] of formulaAtoms(compound.trim()))counts.set(e,(counts.get(e)||0)+k*n);
  }
  return counts;
 });
 return [...new Set(sums.flatMap(s=>[...s.keys()]))].map(e=>[e,sums[0].get(e)||0,sums[1].get(e)||0]);
}

