import {t} from '../i18n.js';
import {$,esc,fmt,toast,dropzone,sortableList,safeName,showResult,ICON,progress} from '../ui.js';
import {task,explain} from '../worker.js';
import {editImage} from './image-editor.js';
export const id='img2pdf',titleKey='imgTitle',descKey='imgDesc',icon=ICON.image;
const items=[],pendingUrls=new Set();
const S={size:'a4',orient:'portrait',margin:2,fit:'cover',quality:100,name:'AroundByteDocument',cw:210,ch:297};
const SIZES={a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],letter:[612,792],legal:[612,1008]};
const MM=72/25.4,MAX_DPI=200;
let busy=false,cur=null,editing=false,generation=0,editorController=null;

const dims=url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve([image.naturalWidth,image.naturalHeight]);image.onerror=reject;image.src=url});

async function addFiles(files,draw,update,token){
  for(const file of files){
    if(token!==generation)return;
    if(!file.size){toast(t('emptyF',{f:file.name}),'err');continue}
    const url=URL.createObjectURL(file);pendingUrls.add(url);
    try{
      const [w,h]=await dims(url);
      if(token!==generation){URL.revokeObjectURL(url);pendingUrls.delete(url);return}
      if(!w||!h)throw new Error('Invalid image dimensions');
      items.push({file,url,w,h,sel:true});pendingUrls.delete(url);
    }catch{
      URL.revokeObjectURL(url);pendingUrls.delete(url);
      if(token===generation)toast(t('badImg',{f:file.name}),'err');
    }
  }
  if(token===generation){draw();update()}
}

function pageFor(item){
  const margin=S.margin*MM;let width,height;
  if(S.size==='original'){width=item.w*.75+2*margin;height=item.h*.75+2*margin}
  else{
    [width,height]=S.size==='custom'?[S.cw*MM,S.ch*MM]:SIZES[S.size];
    if((S.orient==='landscape')===(width<height))[width,height]=[height,width];
  }
  return{w:width,h:height,cw:Math.max(10,width-2*margin),ch:Math.max(10,height-2*margin),m:margin};
}

function jobsFor(){
  return items.filter(item=>item.sel).map(item=>{
    const page=pageFor(item);let sx=0,sy=0,sw=item.w,sh=item.h,dw,dh;
    if(S.fit==='cover'){
      const ratio=page.cw/page.ch;
      if(sw/sh>ratio){const width=sh*ratio;sx=(sw-width)/2;sw=width}
      else{const height=sw/ratio;sy=(sh-height)/2;sh=height}
      dw=page.cw;dh=page.ch;
    }else{const scale=Math.min(page.cw/sw,page.ch/sh);const actualScale=S.fit==='actual'?Math.min(scale,.75):scale;dw=sw*actualScale;dh=sh*actualScale}
    const pixelScale=Math.min(1,dw/72*MAX_DPI/sw);
    return{file:item.file,sx,sy,sw,sh,w:Math.max(1,Math.round(sw*pixelScale)),h:Math.max(1,Math.round(sh*pixelScale)),pw:page.w,ph:page.h,x:(page.w-dw)/2,y:(page.h-dh)/2,dw,dh,quality:S.quality/100};
  });
}

export function mount(root){
  const token=++generation,current=()=>token===generation;
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropImg')}</strong>${t('dropImgSub')}</div>
  <input type="file" id="fi" accept="image/*" multiple hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button></div>
  <div class="list" id="list"></div></div>
  <div class="panel"><h2>${t('settings')}</h2>
  <label>${t('size')}<select id="size">${['a4','a3','a5','letter','legal'].map(key=>`<option value="${key}">${key==='letter'||key==='legal'?key[0].toUpperCase()+key.slice(1):key.toUpperCase()}</option>`).join('')}<option value="original">${t('orig')}</option><option value="custom">${t('custom')}</option></select></label>
  <div class="two" id="cust"><label>${t('w')}<input id="cw" type="number" min="20" max="2000" value="${S.cw}"></label><label>${t('h')}<input id="ch" type="number" min="20" max="2000" value="${S.ch}"></label></div>
  <label id="olab">${t('orient')}<select id="orient"><option value="portrait">${t('portrait')}</option><option value="landscape">${t('landscape')}</option></select></label>
  <label>${t('margin')}<input id="margin" type="number" min="0" max="50" value="${S.margin}"></label>
  <label>${t('fit')}<select id="fit"><option value="contain">${t('fitContain')}</option><option value="cover">${t('fitCover')}</option><option value="actual">${t('fitActual')}</option></select></label>
  <label>${t('quality')}: <span id="qv">${S.quality}</span>%<input id="quality" type="range" min="40" max="100" value="${S.quality}"></label>
  <label>${t('fname')}<input id="name" value="${esc(S.name)}"></label>
  <div class="prog" hidden><i></i></div><div class="pt" hidden></div>
  <button class="btn pri" id="go">${t('create')}</button><button class="btn" id="stop" hidden>${t('cancel')}</button></div></div>`;

  const prog=progress(root);
  const upd=()=>{
    if(!current())return;
    const count=items.filter(item=>item.sel).length;
    $('#cnt',root).textContent=items.length?t('selected',{n:count,m:items.length}):'';
    $('#go',root).disabled=busy||editing||!count;
    root.querySelectorAll('[data-act="edit"]').forEach(button=>button.disabled=busy||editing);
    $('#cust',root).hidden=S.size!=='custom';$('#olab',root).hidden=S.size==='original';
  };
  const draw=sortableList($('#list',root),items,{
    row:item=>`<input type="checkbox" data-act="sel" aria-label="${esc(item.file.name)}" ${item.sel?'checked':''}><img src="${item.url}" alt=""><div class="meta"><b>${esc(item.file.name)}</b><small>${item.w}×${item.h} px · ${fmt(item.file.size)}</small></div><button class="btn ghost abie-edit-btn" type="button" data-act="edit">${t('editImage')}</button>`,
    onRemove:item=>URL.revokeObjectURL(item.url),onChange:upd
  });
  dropzone($('#dz',root),$('#fi',root),files=>addFiles(files,draw,upd,token));

  $('#list',root).addEventListener('click',async event=>{
    const button=event.target.closest('[data-act="edit"]');
    if(!current()||!button||busy||editing)return;
    const row=button.closest('.row'),item=items[Number(row?.dataset.i)];
    if(!item)return;
    editing=true;const controller=new AbortController();editorController=controller;upd();
    try{
      const edited=await editImage(item.file,{signal:controller.signal});
      if(edited&&current()&&!controller.signal.aborted&&items.includes(item)){
        const newUrl=URL.createObjectURL(edited);
        try{
          const [width,height]=await dims(newUrl);
          if(!current()||controller.signal.aborted||!items.includes(item)){URL.revokeObjectURL(newUrl);return}
          const oldUrl=item.url;
          Object.assign(item,{file:edited,url:newUrl,w:width,h:height});
          URL.revokeObjectURL(oldUrl);
        }catch(error){URL.revokeObjectURL(newUrl);throw error}
      }
    }catch(error){
      if(current()&&error?.name!=='AbortError'){toast(t('imageEditFailed'),'err');console.error('Image editor:',error)}
    }finally{
      if(editorController===controller)editorController=null;
      if(current()){editing=false;draw();upd()}
    }
  });

  for(const key of['size','orient','fit','margin','quality','name','cw','ch']){
    const element=$('#'+key,root);element.value=S[key];
    element.oninput=()=>{S[key]=element.type==='number'||element.type==='range'?+element.value:element.value;if(key==='quality')$('#qv',root).textContent=S[key];upd()};
  }
  $('#sa',root).onclick=()=>{items.forEach(item=>item.sel=true);draw();upd()};
  $('#sn',root).onclick=()=>{items.forEach(item=>item.sel=false);draw();upd()};
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#go',root).onclick=async()=>{
    if(!current()||busy)return;
    busy=true;upd();$('#stop',root).hidden=false;prog.show(true);
    const operation=task('pdfimg',{jobs:jobsFor()},{onProgress:(a,b)=>{if(current())prog.set(a,b)}});cur=operation;
    try{
      const {bytes,pages}=await operation.promise;
      if(!current())return;
      showResult({blob:new Blob([bytes],{type:'application/pdf'}),name:safeName(S.name),pages});
    }catch(error){if(current())error==='cancel'?toast(t('cancelled')):toast(explain(error),'err')}
    finally{if(current()){if(cur===operation)cur=null;busy=false;prog.show(false);$('#stop',root).hidden=true;upd()}}
  };
  draw();upd();
}

export function unmount({preserveState=false}={}){
  generation++;
  editorController?.abort();editorController=null;
  cur?.cancel();cur=null;
  busy=false;editing=false;
  for(const url of pendingUrls)URL.revokeObjectURL(url);
  pendingUrls.clear();
  if(!preserveState){for(const item of items)URL.revokeObjectURL(item.url);items.length=0}
}
