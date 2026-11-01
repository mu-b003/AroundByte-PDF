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
  const bmp=await createImageBitmap(j.file),cv=new OffscreenCanvas(j.w,j.h),g=cv.getContext('2d');
  if(j.white){g.fillStyle='#fff';g.fillRect(0,0,j.w,j.h)}
  g.drawImage(bmp,j.sx,j.sy,j.sw,j.sh,0,0,j.w,j.h);bmp.close();
  const blob=await cv.convertToBlob({type:j.type,quality:j.quality});
  if(blob.type!==j.type)fail('type',j.file.name);
  return blob;
}
const finish=async(doc,pages)=>{
  const bytes=await doc.save();
  if((await PDFLib.PDFDocument.load(bytes)).getPageCount()!==pages)fail('verify');   // verify before offering download
  return{value:{bytes,pages},transfer:[bytes.buffer]};
};
const OPS={
  async inspect({file}){lib('pdf-lib.min.js');return{value:(await openDoc(file)).getPageCount()}},
  async pdfimg({jobs}){lib('pdf-lib.min.js');const doc=await PDFLib.PDFDocument.create();
    const response=await fetch('../../assets/aroundbyte-cover.png');
    if(!response.ok)fail('cover');
    const cover=await doc.embedPng(await response.arrayBuffer());
    doc.addPage([595.28,841.89]).drawImage(cover,{x:0,y:0,width:595.28,height:841.89});
    for(let n=0;n<jobs.length;n++){const j=jobs[n],img=await doc.embedJpg(await(await encode({...j,type:'image/jpeg',white:true})).arrayBuffer());
      doc.addPage([j.pw,j.ph]).drawImage(img,{x:j.x,y:j.y,width:j.dw,height:j.dh});post({type:'progress',a:n+1,b:jobs.length})}
    return finish(doc,jobs.length+1)},
  async merge({files}){lib('pdf-lib.min.js');const out=await PDFLib.PDFDocument.create();let total=0;
    for(let i=0;i<files.length;i++){const src=await openDoc(files[i]);
      (await out.copyPages(src,src.getPageIndices())).forEach(p=>{out.addPage(p);total++});post({type:'progress',a:i+1,b:files.length})}
    return finish(out,total)},
  async export({file,list}){lib('pdf-lib.min.js');const {PDFDocument,degrees}=PDFLib,src=await openDoc(file),out=await PDFDocument.create();
    const copied=await out.copyPages(src,list.map(p=>p.i));
    copied.forEach((pg,k)=>{pg.setRotation(degrees(((src.getPage(list[k].i).getRotation().angle+(list[k].rot||0))%360+360)%360));out.addPage(pg);
      if(k%20===0)post({type:'progress',a:k+1,b:list.length})});
    return finish(out,list.length)},
};
self.onmessage=async({data:{op,payload}})=>{
  try{const r=await OPS[op](payload);post({type:'done',result:r.value},r.transfer)}
  catch(e){post(e&&e.type==='error'?e:{type:'error',code:'fail',message:String(e&&e.message||e)})}
};
