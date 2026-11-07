const BIDI_MARKS=/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;
const ARABIC=/[\u0600-\u06ff]/;
const LATIN=/[A-Za-z]/;

function scriptOf(text){
 const value=text.replace(BIDI_MARKS,'');
 if(ARABIC.test(value))return 'rtl';
 if(LATIN.test(value))return 'ltr';
 return 'neutral';
}

function center(word){
 return ((word.bbox?.x0??0)+(word.bbox?.x1??0))/2;
}

function orderLine(line){
 const words=(line.words||[]).filter(w=>w.text?.trim());
 if(!words.length)return (line.text||'').trim();

 const baseRtl=words.some(w=>scriptOf(w.text)==='rtl');
 const runs=[];

 for(const word of words){
  const script=scriptOf(word.text);
  const previous=runs.at(-1);
  const direction=script==='neutral'?(previous?.direction||'ltr'):script;

  if(previous&&previous.direction===direction){
   previous.words.push(word);
  }else{
   runs.push({direction,words:[word]});
  }
 }

 runs.sort((a,b)=>{
  const delta=center(b.words[0])-center(a.words[0]);
  return baseRtl?delta:-delta;
 });

 return runs.map(run=>{
  const rtl=run.direction==='rtl';
  run.words.sort((a,b)=>rtl?center(b)-center(a):center(a)-center(b));
  const value=run.words.map(w=>w.text.replace(BIDI_MARKS,'').trim()).filter(Boolean).join(' ');
  if(!value)return '';
  return baseRtl&&run.direction==='ltr'?'\u2066'+value+'\u2069':
   !baseRtl&&rtl?'\u2067'+value+'\u2069':value;
 }).filter(Boolean).join(' ');
}

export function reconstructOcrText(data){
 const blocks=data?.blocks;
 if(!Array.isArray(blocks)||!blocks.length)return (data?.text||'').trim();

 const output=[];
 for(const block of blocks){
  for(const paragraph of block.paragraphs||[]){
   const lines=(paragraph.lines||[]).map(orderLine).filter(Boolean);
   if(lines.length)output.push(lines.join('\n'));
  }
 }
 return output.join('\n\n').trim()||(data?.text||'').trim();
}
