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
  async inspectForms({file}){lib('pdf-lib.min.js');const doc=await openDoc(file);let form;
    try{form=doc.getForm()}catch{form=null}
    const fields=form?form.getFields().map(field=>{const type=typeof field.isChecked==='function'?'PDFCheckBox':typeof field.setText==='function'?'PDFTextField':typeof field.getOptions==='function'?'PDFDropdown':'PDFField',item={name:field.getName(),type};
      try{if(typeof field.getOptions==='function')item.options=field.getOptions()}catch{}
      try{if(typeof field.isChecked==='function')item.checked=field.isChecked()}catch{}
      return item}):[];
    return{value:{pages:doc.getPageCount(),fields}};
  },
  async fillForms({file,values={},flatten=false}){lib('pdf-lib.min.js');const doc=await openDoc(file);let form;
    try{form=doc.getForm()}catch{fail('noforms')}
    const fields=form.getFields();if(!fields.length)fail('noforms');
    for(const field of fields){const name=field.getName();if(!Object.prototype.hasOwnProperty.call(values,name))continue;
      const value=values[name];
      try{
        if(typeof field.isChecked==='function'){value?field.check():field.uncheck()}
        else if(typeof field.setText==='function')field.setText(String(value??''));
        else if(typeof field.select==='function'){if(value!==''&&value!==null&&value!==undefined)field.select(value)}
      }catch{fail('formfield',name,'Could not update form field: '+name)}
    }
    try{form.updateFieldAppearances()}catch{}
    if(flatten===true)form.flatten();
    return finish(doc,doc.getPageCount());
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
  async repair({pages=[]}){lib('pdf-lib.min.js');if(!Array.isArray(pages)||!pages.length)fail('norepairpages');
    const out=await PDFLib.PDFDocument.create();
    for(let i=0;i<pages.length;i++){const item=pages[i];if(!(item.png instanceof Uint8Array)||!item.png.length)fail('badrepair');
      let image;try{image=await out.embedPng(item.png)}catch{fail('badrepair')}
      const width=Math.max(1,Number(item.width)||595.28),height=Math.max(1,Number(item.height)||841.89),page=out.addPage([width,height]);
      page.drawImage(image,{x:0,y:0,width,height});post({type:'progress',a:i+1,b:pages.length});
    }
    return finish(out,pages.length);
  },
  async zip({entries}){lib('jszip.min.js');const zip=new JSZip();
    for(const item of entries){if(!item||!item.name||!item.blob)fail('badzip');const data=item.blob instanceof Blob?new Uint8Array(await item.blob.arrayBuffer()):item.blob;zip.file(item.name,data)}
    const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});
    return{value:{size:blob.size,blob}}},
};
self.onmessage=async({data:{op,payload}})=>{
  try{const r=await OPS[op](payload);post({type:'done',result:r.value},r.transfer)}
  catch(e){post(e&&e.type==='error'?e:{type:'error',code:'fail',message:String(e&&e.message||e)})}
};
