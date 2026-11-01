import {t} from '../i18n.js';
import {$,esc,fmt,toast,dropzone,sortableList,safeName,showResult,ICON,progress} from '../ui.js';
import {task,explain} from '../worker.js';
import {editImage} from './image-editor.js';
export const id='img2pdf',titleKey='imgTitle',descKey='imgDesc',icon=ICON.image;
const items=[];                       // {file,url,w,h,sel}
const S={size:'a4',orient:'portrait',margin:2,fit:'cover',quality:100,name:'AroundByteDocument',cw:210,ch:297};
const SIZES={a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],letter:[612,792],legal:[612,1008]};
const MM=72/25.4, MAX_DPI=200;
let busy=false,cur=null,editing=false;

const dims=url=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res([i.naturalWidth,i.naturalHeight]);i.onerror=rej;i.src=url});
async function addFiles(files,draw,update){
  for(const f of files){
    if(!f.size){toast(t('emptyF',{f:f.name}),'err');continue}
    const url=URL.createObjectURL(f);
    try{const [w,h]=await dims(url);if(!w||!h)throw 0;items.push({file:f,url,w,h,sel:true})}
    catch{URL.revokeObjectURL(url);toast(t('badImg',{f:f.name}),'err')}
  }
  draw();update();
}
// Page size in points for one image, honouring size, orientation and margin.
function pageFor(it){
  const m=S.margin*MM;let w,h;
  if(S.size==='original'){w=it.w*.75+2*m;h=it.h*.75+2*m}
  else{[w,h]=S.size==='custom'?[S.cw*MM,S.ch*MM]:SIZES[S.size];
    if((S.orient==='landscape')===(w<h))[w,h]=[h,w]}
  return{w,h,cw:Math.max(10,w-2*m),ch:Math.max(10,h-2*m),m};
}
// Geometry for every selected image is computed here (cheap); encoding and PDF assembly run in the worker.
function jobsFor(){return items.filter(i=>i.sel).map(it=>{
  const p=pageFor(it);let sx=0,sy=0,sw=it.w,sh=it.h,dw,dh;
  if(S.fit==='cover'){const r=p.cw/p.ch;if(sw/sh>r){const nw=sh*r;sx=(sw-nw)/2;sw=nw}else{const nh=sw/r;sy=(sh-nh)/2;sh=nh}dw=p.cw;dh=p.ch}
  else{let k=Math.min(p.cw/sw,p.ch/sh);if(S.fit==='actual')k=Math.min(k,.75);dw=sw*k;dh=sh*k}
  const px=Math.min(1,dw/72*MAX_DPI/sw);   // cap at MAX_DPI to limit memory and file size
  return{file:it.file,sx,sy,sw,sh,w:Math.max(1,Math.round(sw*px)),h:Math.max(1,Math.round(sh*px)),pw:p.w,ph:p.h,x:(p.w-dw)/2,y:(p.h-dh)/2,dw,dh,quality:S.quality/100}})}

export function mount(root){
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropImg')}</strong>${t('dropImgSub')}</div>
  <input type="file" id="fi" accept="image/*" multiple hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button></div>
  <div class="list" id="list"></div></div>
  <div class="panel"><h2>${t('settings')}</h2>
  <label>${t('size')}<select id="size">${['a4','a3','a5','letter','legal'].map(k=>`<option value="${k}">${k==='letter'||k==='legal'?k[0].toUpperCase()+k.slice(1):k.toUpperCase()}</option>`).join('')}<option value="original">${t('orig')}</option><option value="custom">${t('custom')}</option></select></label>
  <div class="two" id="cust"><label>${t('w')}<input id="cw" type="number" min="20" max="2000" value="${S.cw}"></label><label>${t('h')}<input id="ch" type="number" min="20" max="2000" value="${S.ch}"></label></div>
  <label id="olab">${t('orient')}<select id="orient"><option value="portrait">${t('portrait')}</option><option value="landscape">${t('landscape')}</option></select></label>
  <label>${t('margin')}<input id="margin" type="number" min="0" max="50" value="${S.margin}"></label>
  <label>${t('fit')}<select id="fit"><option value="contain">${t('fitContain')}</option><option value="cover">${t('fitCover')}</option><option value="actual">${t('fitActual')}</option></select></label>
  <label>${t('quality')}: <span id="qv">${S.quality}</span>%<input id="quality" type="range" min="40" max="100" value="${S.quality}"></label>
  <label>${t('fname')}<input id="name" value="${esc(S.name)}"></label>
  <div class="prog" hidden><i></i></div><div class="pt" hidden></div>
  <button class="btn pri" id="go">${t('create')}</button><button class="btn" id="stop" hidden>${t('cancel')}</button></div></div>`;
  const prog=progress(root);
  const upd=()=>{const n=items.filter(i=>i.sel).length;$('#cnt',root).textContent=items.length?t('selected',{n,m:items.length}):'';
    $('#go',root).disabled=busy||editing||!n;
    root.querySelectorAll('[data-act="edit"]').forEach(b=>b.disabled=busy||editing);
    $('#cust',root).hidden=S.size!=='custom';$('#olab',root).hidden=S.size==='original'};
  const draw=sortableList($('#list',root),items,{
    row:it=>`<input type="checkbox" data-act="sel" aria-label="${esc(it.file.name)}" ${it.sel?'checked':''}><img src="${it.url}" alt=""><div class="meta"><b>${esc(it.file.name)}</b><small>${it.w}×${it.h} px · ${fmt(it.file.size)}</small></div><button class="btn ghost abie-edit-btn" type="button" data-act="edit">${t('editImage')}</button>`,
    onRemove:it=>URL.revokeObjectURL(it.url),onChange:upd});
  dropzone($('#dz',root),$('#fi',root),f=>addFiles(f,draw,upd));

  $('#list',root).addEventListener('click',async e=>{
    const button=e.target.closest('[data-act="edit"]');
    if(!button||busy||editing)return;
    const row=button.closest('.row');
    const it=items[Number(row?.dataset.i)];
    if(!it)return;

    editing=true;
    upd();
    try{
      const edited=await editImage(it.file);
      if(edited){
        const newUrl=URL.createObjectURL(edited);
        try{
          const [w,h]=await dims(newUrl);
          const oldUrl=it.url;
          it.file=edited;
          it.url=newUrl;
          it.w=w;
          it.h=h;
          URL.revokeObjectURL(oldUrl);
        }catch(error){
          URL.revokeObjectURL(newUrl);
          throw error;
        }
      }
    }catch(error){
      toast(t('imageEditFailed'),'err');
      console.error('Image editor:',error);
    }finally{
      editing=false;
      draw();
      upd();
    }
  });
  for(const k of['size','orient','fit','margin','quality','name','cw','ch']){const el=$('#'+k,root);el.value=S[k];
    el.oninput=()=>{S[k]=el.type==='number'||el.type==='range'?+el.value:el.value;if(k==='quality')$('#qv',root).textContent=S[k];upd()}}
  $('#sa',root).onclick=()=>{items.forEach(i=>i.sel=true);draw();upd()};
  $('#sn',root).onclick=()=>{items.forEach(i=>i.sel=false);draw();upd()};
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#go',root).onclick=async()=>{
    if(busy)return;busy=true;upd();$('#stop',root).hidden=false;prog.show(true);
    try{const {bytes,pages}=await (cur=task('pdfimg',{jobs:jobsFor()},{onProgress:prog.set})).promise,name=safeName(S.name),blob=new Blob([bytes],{type:'application/pdf'});
      showResult({blob,name,pages})}
    catch(e){e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}
    finally{busy=false;prog.show(false);$('#stop',root).hidden=true;upd()}
  };
  draw();upd();
}
