export const letters=s=>s.normalize('NFC').toLocaleUpperCase('kk').replace(/[^\p{L}]/gu,'');
const key=(x,y)=>x+','+y;
// Every new word must cross an existing word, without touching it elsewhere.
export function crossword(terms){
 const words=terms.map(([name,clue])=>({name,clue,word:letters(name)}));
 let best=null;
 const build=(placed,remaining,grid)=>{
  if(!remaining.length){
   const cells=[...grid.values()],x=Math.min(...cells.map(c=>c.x)),y=Math.min(...cells.map(c=>c.y));
   const width=Math.max(...cells.map(c=>c.x))-x+1,height=Math.max(...cells.map(c=>c.y))-y+1;
   if(!best||width*height<best.width*best.height)best={width,height,words:placed.map((w,i)=>({...w,num:i+1,x:w.x-x,y:w.y-y}))};return;
  }
  for(const w of remaining)for(const c of grid.values()){
   if(c.dirs.size>1)continue;
   const horizontal=!c.dirs.has(true),dx=Number(horizontal),dy=1-dx;
   for(let j=0;j<w.word.length;j++){
    if(w.word[j]!==c.letter)continue;
    const x=c.x-j*dx,y=c.y-j*dy,n=w.word.length,g=new Map(grid);
    if(g.has(key(x-dx,y-dy))||g.has(key(x+n*dx,y+n*dy)))continue;
    let valid=true;
    for(let i=0;i<n;i++){
     const a=x+i*dx,b=y+i*dy,k=key(a,b),target=g.get(k);
     if(target?(target.letter!==w.word[i]||target.dirs.has(horizontal)):(g.has(key(a-dy,b-dx))||g.has(key(a+dy,b+dx)))){valid=false;break;}
     g.set(k,{x:a,y:b,letter:w.word[i],dirs:new Set([...(target?.dirs||[]),horizontal])});
    }
    if(valid)build([...placed,{...w,x,y,horizontal}],remaining.filter(item=>item!==w),g);
   }
  }
 };
 for(const w of words){
  const grid=new Map(Array.from(w.word,(letter,i)=>[key(i,0),{x:i,y:0,letter,dirs:new Set([true])}]));
  build([{...w,x:0,y:0,horizontal:true}],words.filter(q=>q!==w),grid);
 }
 return best;
}
