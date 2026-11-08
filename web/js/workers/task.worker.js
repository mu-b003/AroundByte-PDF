/* Heavy-lifting worker: image encoding, PDF building/merging/export, ZIP.
   Cancelling = worker.terminate() from the client, so no operation can keep running after Cancel. */
const lib=n=>importScripts('../../vendor/'+n);
const post=(m,tr)=>self.postMessage(m,tr||[]);
const fail=(code,name,message)=>{throw{type:'error',code,name,message}};
async function openDoc(file){
  if(!file.size)fail('empty',file.name);
  const head=new TextDecoder('latin1').decode(new Uint8Array(await file.slice(0,1024).arrayBuffer()));
  if(head.indexOf('%PDF-')<0)fail('bad',file.name);
  let doc;
  try{doc=await PDFLib.PDFDocument.load(await file.arrayBuffer());if(!doc.getPageCount())throw new Error('no pages')}   // header-only / damaged files can parse leniently
  catch(e){fail(/encrypt/i.test(e.message)?'enc':'bad',file.name)}
  return doc;
}
// j: {file,sx,sy,sw,sh,w,h,type,quality,white}
async function encode(j){
  const bmp=await createImageBitmap(j.file);
  let cv;
  try{
    cv=new OffscreenCanvas(j.w,j.h);
    const g=cv.getContext('2d');
    if(j.white){g.fillStyle='#fff';g.fillRect(0,0,j.w,j.h)}
    g.drawImage(bmp,j.sx,j.sy,j.sw,j.sh,0,0,j.w,j.h);
    const blob=await cv.convertToBlob({type:j.type,quality:j.quality});
    if(blob.type!==j.type)fail('type',j.file.name);
    return blob;
  }finally{
    bmp.close();
    if(cv){cv.width=0;cv.height=0}
  }
}
const finish=async(doc,pages)=>{
  const bytes=await doc.save();
  if((await PDFLib.PDFDocument.load(bytes)).getPageCount()!==pages)fail('verify');   // verify before offering download
  return{value:{bytes,pages},transfer:[bytes.buffer]};
};
const OPS={
  async inspect({file}){lib('pdf-lib.min.js');return{value:(await openDoc(file)).getPageCount()}},
  async pdfimg({jobs,addCover=false}){lib('pdf-lib.min.js');const doc=await PDFLib.PDFDocument.create();
    if(addCover===true){
      const response=await fetch('../../assets/aroundbyte-cover.png');
      if(!response.ok)fail('cover');
      const cover=await doc.embedPng(await response.arrayBuffer());
      doc.addPage([595.28,841.89]).drawImage(cover,{x:0,y:0,width:595.28,height:841.89});
    }
    for(let n=0;n<jobs.length;n++){const j=jobs[n],img=await doc.embedJpg(await(await encode({...j,type:'image/jpeg',white:true})).arrayBuffer());
      doc.addPage([j.pw,j.ph]).drawImage(img,{x:j.x,y:j.y,width:j.dw,height:j.dh});post({type:'progress',a:n+1,b:jobs.length})}
    return finish(doc,jobs.length+(addCover===true?1:0))},
  async merge({files}){lib('pdf-lib.min.js');const out=await PDFLib.PDFDocument.create();let total=0;
    for(let i=0;i<files.length;i++){const src=await openDoc(files[i]);
      (await out.copyPages(src,src.getPageIndices())).forEach(p=>{out.addPage(p);total++});post({type:'progress',a:i+1,b:files.length})}
    return finish(out,total)},
  async export({file,list}){lib('pdf-lib.min.js');const {PDFDocument,degrees}=PDFLib,src=await openDoc(file),out=await PDFDocument.create();
    const copied=await out.copyPages(src,list.map(p=>p.i));
    copied.forEach((pg,k)=>{pg.setRotation(degrees(((src.getPage(list[k].i).getRotation().angle+(list[k].rot||0))%360+360)%360));out.addPage(pg);
      if(k%20===0)post({type:'progress',a:k+1,b:list.length})});
    return finish(out,list.length)},
  async rotate({file,angle}){lib('pdf-lib.min.js');const {degrees}=PDFLib,doc=await openDoc(file);if(![90,180,270].includes(Number(angle)))fail('badangle');
    doc.getPages().forEach(p=>p.setRotation(degrees((p.getRotation().angle+angle+360)%360)));
    return finish(doc,doc.getPageCount())},
  async crop({file,boxes=[]}){lib('pdf-lib.min.js');const doc=await openDoc(file),pages=doc.getPages();
    if(!Array.isArray(boxes)||boxes.length!==pages.length)fail('badcrop');
    for(let i=0;i<pages.length;i++){const b=boxes[i],p=pages[i],m=p.getMediaBox();
      const x=Number(b?.x),y=Number(b?.y),width=Number(b?.width),height=Number(b?.height);
      if(![x,y,width,height].every(Number.isFinite)||width<10||height<10||x<m.x-1||y<m.y-1||x+width>m.x+m.width+1||y+height>m.y+m.height+1)fail('badcrop');
      p.setCropBox(x,y,width,height);if(i%10===0)post({type:'progress',a:i+1,b:pages.length});
    }
    return finish(doc,pages.length)},
  async watermark({file,png}){lib('pdf-lib.min.js');const doc=await openDoc(file);
    if(!(png instanceof Uint8Array)||!png.length)fail('badtext');
    let image;try{image=await doc.embedPng(png)}catch(e){fail('badtext')}
    doc.getPages().forEach(p=>{const {width,height}=p.getSize();
      const scale=Math.min(1,width*.9/image.width,height*.9/image.height);
      const w=image.width*scale,h=image.height*scale;
      p.drawImage(image,{x:(width-w)/2,y:(height-h)/2,width:w,height:h})});
    return finish(doc,doc.getPageCount())},
  async numbers({file,start,size,format}){lib('pdf-lib.min.js');const {StandardFonts,rgb}=PDFLib,doc=await openDoc(file),font=await doc.embedFont(StandardFonts.Helvetica);start=Math.max(1,Math.min(9999,Number(start)||1));size=Math.max(8,Math.min(24,Number(size)||11));
    doc.getPages().forEach((p,i)=>{const {width}=p.getSize(),label=format==='of'?`${i+1+start-1} / ${doc.getPageCount()+start-1}`:`${i+start}`;
      const s=Math.min(size,18),w=font.widthOfTextAtSize(label,s);p.drawText(label,{x:(width-w)/2,y:18,size:s,font,color:rgb(.25,.25,.25)})});
    return finish(doc,doc.getPageCount())},
  async metadata({file,fields}){lib('pdf-lib.min.js');const doc=await openDoc(file);
    if(fields.title!==undefined)doc.setTitle(fields.title);if(fields.author!==undefined)doc.setAuthor(fields.author);
    if(fields.subject!==undefined)doc.setSubject(fields.subject);if(fields.keywords!==undefined)doc.setKeywords(fields.keywords.split(',').map(x=>x.trim()).filter(Boolean));
    if(fields.creator!==undefined)doc.setCreator(fields.creator);if(fields.producer!==undefined)doc.setProducer(fields.producer);
    return finish(doc,doc.getPageCount())},
  async compress({file}){lib('pdf-lib.min.js');const doc=await openDoc(file),original=new Uint8Array(await file.arrayBuffer());
    const optimized=await doc.save({useObjectStreams:true,objectsPerTick:50});
    const compressed=optimized.length<original.length,bytes=compressed?optimized:original;
    const verified=await PDFLib.PDFDocument.load(bytes);
    return{value:{bytes,pages:verified.getPageCount(),compressed,originalSize:original.length,outputSize:bytes.length},transfer:[bytes.buffer]};
  },
  async sign({file,png,page=1,width=150}){lib('pdf-lib.min.js');const doc=await openDoc(file);
    if(!(png instanceof Uint8Array)||!png.length)fail('badsign');
    const pages=doc.getPages(),index=Math.max(0,Math.min(pages.length-1,Number(page)-1||0)),target=pages[index];
    let image;try{image=await doc.embedPng(png)}catch{fail('badsign')}
    const w=Math.max(40,Math.min(target.getWidth()*.8,Number(width)||150)),h=w*image.height/image.width;
    target.drawImage(image,{x:target.getWidth()-w-36,y:36,width:w,height:h});
    return finish(doc,pages.length);
  },
  async redact({file,pages=[]}){lib('pdf-lib.min.js');const src=await openDoc(file),out=await PDFLib.PDFDocument.create(),byIndex=new Map(pages.map(p=>[Number(p.index),p]));
    for(let i=0;i<src.getPageCount();i++){
      const marked=byIndex.get(i);
      if(marked){const original=src.getPage(i),originalSize=original.getSize(),width=Math.max(1,Number(marked.width)||originalSize.width),height=Math.max(1,Number(marked.height)||originalSize.height);let image;
        try{image=await out.embedPng(marked.png)}catch{fail('badredact')}
        const page=out.addPage([width,height]);page.drawImage(image,{x:0,y:0,width,height});
      }else{const [copy]=await out.copyPages(src,[i]);out.addPage(copy)}
      if(i%5===0)post({type:'progress',a:i+1,b:src.getPageCount()});
    }
    return finish(out,src.getPageCount());
  },
  async border({file,preset='classic',color='#ffc400',thickness=2,inset=24,mode='all',range=''}){lib('pdf-lib.min.js');const doc=await openDoc(file),{rgb}=PDFLib,pages=doc.getPages(),hex=String(color).match(/^#([0-9a-f]{6})$/i);if(!hex)fail('badborder');const n=parseInt(hex[1],16),c=rgb(((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255),w=Math.max(1,Math.min(8,Number(thickness)||2)),m=Math.max(8,Math.min(72,Number(inset)||24));let chosen=new Set();
    if(mode==='all')pages.forEach((_,i)=>chosen.add(i));else if(mode==='odd'||mode==='even')pages.forEach((_,i)=>{if((i+1)%2===(mode==='odd'?1:0))chosen.add(i)});else if(mode==='custom'){const parts=String(range).split(',').map(x=>x.trim());for(const part of parts){const mt=part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!mt)fail('badrange');const a=Number(mt[1]),b=Number(mt[2]||mt[1]);if(a<1||b<a||b>pages.length)fail('badrange');for(let i=a;i<=b;i++)chosen.add(i-1)}}else fail('badrange');if(!chosen.size)fail('badrange');
    for(let i=0;i<pages.length;i++){if(!chosen.has(i))continue;const p=pages[i],{width:pw,height:ph}=p.getSize(),x=m,y=m,ww=Math.max(1,pw-2*m),hh=Math.max(1,ph-2*m),x2=x+ww,y2=y+hh;const line=(x1,y1,x2,y2,th=w)=>p.drawLine({start:{x:x1,y:y1},end:{x:x2,y:y2},thickness:th,color:c});const rect=(xx,yy,ww2,hh2,th=w)=>p.drawRectangle({x:xx,y:yy,width:ww2,height:hh2,borderColor:c,borderWidth:th,color:PDFLib.rgb(1,1,1),opacity:0,borderOpacity:1});const circle=(cx,cy,r)=>p.drawCircle({x:cx,y:cy,size:r,borderColor:c,borderWidth:w,color:c,opacity:0,borderOpacity:1});
      if(preset==='classic')rect(x,y,ww,hh);
      else if(preset==='double'){rect(x,y,ww,hh);rect(x+8,y+8,ww-16,hh-16,Math.max(1,w*.65))}
      else if(preset==='minimal'){line(x,y,x2,y);line(x,y,x,y2);line(x2,y,x2,y2);line(x,y2,x2,y2)}
      else if(preset==='corner'){const q=Math.min(38,ww*.14,hh*.14);[[x,y,1,1],[x2,y,-1,1],[x,y2,1,-1],[x2,y2,-1,-1]].forEach(([cx,cy,sx,sy])=>{line(cx,cy,cx+sx*q,cy);line(cx,cy,cx,cy+sy*q);line(cx+sx*q*.25,cy+sy*q*.25,cx+sx*q*.72,cy+sy*q*.25,Math.max(1,w*.6))})}
      else if(preset==='rounded'){const r=Math.min(18,ww/8,hh/8);rect(x+r,y,ww-2*r,hh);rect(x,y+r,ww,hh-2*r);[[x+r,y+r],[x2-r,y+r],[x+r,y2-r],[x2-r,y2-r]].forEach(([cx,cy])=>p.drawCircle({x:cx,y:cy,size:r,borderColor:c,borderWidth:w,color:PDFLib.rgb(1,1,1),opacity:0,borderOpacity:1}))}
      else if(preset==='dotted'){const step=12;for(let xx=x;xx<=x2;xx+=step){circle(xx,y,Math.max(1.1,w));circle(xx,y2,Math.max(1.1,w))}for(let yy=y+step;yy<y2;yy+=step){circle(x,yy,Math.max(1.1,w));circle(x2,yy,Math.max(1.1,w))}}
      else if(preset==='dashed'){const dash=12,gap=7;for(let xx=x;xx<x2;xx+=dash+gap){line(xx,y,Math.min(x2,xx+dash),y);line(xx,y2,Math.min(x2,xx+dash),y2)}for(let yy=y;yy<y2;yy+=dash+gap){line(x,yy,x,Math.min(y2,yy+dash));line(x2,yy,x2,Math.min(y2,yy+dash))}}
      else if(preset==='geometric'){rect(x,y,ww,hh);rect(x+7,y+7,ww-14,hh-14,Math.max(1,w*.6));const s=10;[[x,y],[x2,y],[x,y2],[x2,y2]].forEach(([cx,cy])=>{line(cx-s,cy,cx,cy+(cy===y?s:-s));line(cx,cy+(cy===y?s:-s),cx+s,cy)})}
      else if(preset==='artdeco'){rect(x,y,ww,hh);const q=Math.min(28,ww*.12,hh*.12);[[x,y,1,1],[x2,y,-1,1],[x,y2,1,-1],[x2,y2,-1,-1]].forEach(([cx,cy,sx,sy])=>{line(cx,cy+sy*q,cx+sx*q,cy);line(cx+sx*q*.3,cy+sy*q,cx+sx*q,cy+sy*q*.3,Math.max(1,w*.65));circle(cx+sx*q*.18,cy+sy*q*.18,2)})}
      else if(preset==='botanical'){rect(x,y,ww,hh,Math.max(1,w*.7));const step=24;for(let xx=x+12;xx<x2-8;xx+=step){p.drawEllipse({x:xx,y:y+3,xScale:4,yScale:8,rotate:PDFLib.degrees(45),borderColor:c,borderWidth:Math.max(1,w*.55),color:c,opacity:0,borderOpacity:1});p.drawEllipse({x:xx+step/2,y:y2-3,xScale:4,yScale:8,rotate:PDFLib.degrees(-45),borderColor:c,borderWidth:Math.max(1,w*.55),color:c,opacity:0,borderOpacity:1})}for(let yy=y+12;yy<y2-8;yy+=step){p.drawEllipse({x:x+3,y:yy,xScale:4,yScale:8,rotate:PDFLib.degrees(-45),borderColor:c,borderWidth:Math.max(1,w*.55),color:c,opacity:0,borderOpacity:1});p.drawEllipse({x:x2-3,y:yy,xScale:4,yScale:8,rotate:PDFLib.degrees(45),borderColor:c,borderWidth:Math.max(1,w*.55),color:c,opacity:0,borderOpacity:1})}}
      else if(preset==='certificate'){rect(x,y,ww,hh);rect(x+5,y+5,ww-10,hh-10,Math.max(1,w*.6));for(const [cx,cy] of [[x,y],[x2,y],[x,y2],[x2,y2]]){circle(cx,cy,5);circle(cx,cy,2)}}
      else {rect(x,y,ww,hh);rect(x+5,y+5,ww-10,hh-10,Math.max(1,w*.65));const step=22;for(let xx=x+step;xx<x2-step;xx+=step){circle(xx,y,3);circle(xx,y2,3)}for(let yy=y+step;yy<y2-step;yy+=step){circle(x,yy,3);circle(x2,yy,3)}}
      if(i%10===0)post({type:'progress',a:i+1,b:pages.length});
    }return finish(doc,pages.length)},
  async zip({entries}){lib('jszip.min.js');const zip=new JSZip();
    for(const item of entries){if(!item||!item.name||!item.blob)fail('badzip');const data=item.blob instanceof Blob?new Uint8Array(await item.blob.arrayBuffer()):item.blob;zip.file(item.name,data)}
    const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
    return{value:{size:blob.size,blob}}},
};
self.onmessage=async({data:{op,payload}})=>{
  try{const r=await OPS[op](payload);post({type:'done',result:r.value},r.transfer)}
  catch(e){post(e&&e.type==='error'?e:{type:'error',code:'fail',message:String(e&&e.message||e)})}
};
