import {t} from '../i18n.js';
import {$,toast,dropzone,safeName,ICON} from '../ui.js';
import Tesseract from '../../vendor/tesseract/engine/tesseract.esm.min.js';

export const id='image-to-text',titleKey='imageTextTitle',descKey='imageTextDesc',icon=ICON.image;
let files=[],worker=null,generation=0,busy=false,cancelRequested=false;

export function mount(root){
 const token=++generation,current=()=>token===generation;
 root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('imageTextDrop')}</strong>${t('imageTextDropSub')}</div>
  <input id="fi" type="file" accept="image/*" multiple hidden>
  <div class="bar"><span id="info">${t('imageTextEmpty')}</span><span class="sp"></span><button class="btn ghost" id="clear" disabled>${t('imageTextClear')}</button></div>
  <div class="empty" id="filelist">${t('imageTextEmpty')}</div>
  <div class="bar"><span id="status"></span></div>
  <div class="prog" id="progress" hidden><i id="progressFill"></i></div>
  <label for="result">${t('imageTextResult')}</label>
  <textarea id="result" rows="14" dir="auto" placeholder="${t('imageTextPlaceholder')}" spellcheck="false"></textarea>
  <div class="bar"><button class="btn" id="copy" disabled>${t('imageTextCopy')}</button><button class="btn" id="download" disabled>${t('imageTextDownload')}</button></div>
 </div><div class="panel"><h2>${t('imageTextTitle')}</h2><p class="muted">${t('imageTextHint')}</p><p class="muted">${t('imageTextPrivacy')}</p>
  <button class="btn pri" id="go" disabled>${t('imageTextRun')}</button><button class="btn" id="stop" hidden>${t('cancel')}</button>
 </div></div>`;

 const $r=s=>$(s,root);
 const update=()=>{
  if(!current())return;
  $r('#go').disabled=busy||!files.length;
  $r('#clear').disabled=busy||!files.length;
  $r('#stop').hidden=!busy;
  $r('#copy').disabled=!$r('#result').value.trim();
  $r('#download').disabled=!$r('#result').value.trim();
 };
 const renderFiles=()=>{
  const list=$r('#filelist');list.replaceChildren();
  if(!files.length){
   list.className='empty';list.textContent=t('imageTextEmpty');
   $r('#info').textContent=t('imageTextEmpty');
  }else{
   list.className='';
   const ul=document.createElement('ul');
   ul.style.cssText='margin:8px 0;padding-inline-start:22px;line-height:1.9';
   files.forEach(f=>{
    const li=document.createElement('li');
    li.textContent=f.name+' · '+(f.size<1048576?(f.size/1024).toFixed(0)+' KB':(f.size/1048576).toFixed(1)+' MB');
    ul.append(li);
   });
   list.append(ul);
   $r('#info').textContent=t('imageTextSelected',{n:files.length});
  }
  update();
 };

 dropzone($r('#dz'),$r('#fi'),picked=>{
  if(busy)return;
  const images=picked.filter(f=>f.type.startsWith('image/'));
  if(!images.length)return toast(t('imageTextNoImages'),'err');
  files=images;
  $r('#result').value='';
  $r('#status').textContent='';
  renderFiles();
 });

 $r('#clear').onclick=()=>{
  if(busy)return;
  files=[];$r('#result').value='';$r('#status').textContent='';
  $r('#progress').hidden=true;renderFiles();
 };

 $r('#go').onclick=async()=>{
  if(!current()||busy||!files.length)return;
  busy=true;cancelRequested=false;
  const batch=[...files];
  $r('#result').value='';
  $r('#progress').hidden=false;
  $r('#progressFill').style.width='0%';
  $r('#status').textContent=t('imageTextStarting');
  update();
  let localWorker=null;
  try{
   localWorker=await Tesseract.createWorker('ara+eng',1,{
    workerPath:new URL('../../vendor/tesseract/engine/worker.min.js',import.meta.url).href,
    corePath:new URL('../../vendor/tesseract/core/',import.meta.url).href,
    langPath:new URL('../../vendor/tesseract/lang/',import.meta.url).href,
    gzip:true,
    workerBlobURL:false,
    cacheMethod:'none',
    logger:m=>{
     if(!current()||cancelRequested)return;
     if(typeof m.progress==='number')
      $r('#progressFill').style.width=Math.round(m.progress*100)+'%';
     if(m.status)$r('#status').textContent=m.status;
    }
   });
   if(!current()||cancelRequested)return;
   worker=localWorker;
   await localWorker.setParameters({
    tessedit_pageseg_mode:Tesseract.PSM.SINGLE_BLOCK,
    preserve_interword_spaces:'1'
   });
   const output=[];
   for(let i=0;i<batch.length;i++){
    if(!current()||cancelRequested||worker!==localWorker)return;
    $r('#status').textContent=t('imageTextWorking',{a:i+1,b:batch.length});
    const result=await localWorker.recognize(batch[i]);
    if(!current()||cancelRequested||worker!==localWorker)return;
    const recognized=result?.data?.text?.trim()||'';
    output.push((batch.length>1?'===== '+batch[i].name+' =====\n':'')+
      (recognized||t('imageTextNoText')));
    $r('#result').value=output.join('\n\n');
    $r('#progressFill').style.width=Math.round((i+1)/batch.length*100)+'%';
    update();
   }
   $r('#status').textContent=t('imageTextComplete');
  }catch(e){
   if(current()&&!cancelRequested)toast(e?.message||t('imageTextFailed'),'err');
  }finally{
   if(localWorker){
    if(worker===localWorker)worker=null;
    try{await localWorker.terminate()}catch{}
   }
   if(current()){
    busy=false;
    $r('#progress').hidden=true;
    update();
   }
  }
 };

 $r('#stop').onclick=async()=>{
  cancelRequested=true;
  const w=worker;worker=null;
  if(w)try{await w.terminate()}catch{}
  if(current()){
   busy=false;
   $r('#status').textContent=t('cancelled');
   update();
  }
 };

 $r('#copy').onclick=async()=>{
  const value=$r('#result').value;
  if(!value.trim())return;
  try{
   await navigator.clipboard.writeText(value);
   toast(t('imageTextCopied'));
  }catch{
   $r('#result').focus();$r('#result').select();
   try{document.execCommand('copy');toast(t('imageTextCopied'))}
   catch{toast(t('imageTextCopyFailed'),'err')}
  }
 };

 $r('#download').onclick=()=>{
  const value=$r('#result').value;
  if(!value.trim())return;
  const blob=new Blob([value],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=safeName(files[0]?.name?.replace(/\.[^.]+$/,'')||'image-text')+'.txt';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 renderFiles();update();
}

export function unmount(){
 generation++;
 const w=worker;worker=null;files=[];busy=false;cancelRequested=true;
 if(w)w.terminate().catch(()=>{});
}
