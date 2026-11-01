import {t} from '../i18n.js';
import {$,esc,fmt,toast,dropzone,sortableList,safeName,showResult,ICON,progress} from '../ui.js';
import {task,explain} from '../worker.js';
export const id='merge',titleKey='mrgTitle',descKey='mrgDesc',icon=ICON.merge;
const items=[];let name='merged',busy=false,cur=null;
async function addFiles(files,draw,upd){
  for(const f of files){
    try{items.push({file:f,pages:await task('inspect',{file:f}).promise})}   // validation + page count in the worker
    catch(e){toast(explain(e),'err')}
  }
  draw();upd();
}
export function mount(root){
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropPdf')}</strong>${t('dropPdfSub')}</div>
  <input type="file" id="fi" accept="application/pdf,.pdf" multiple hidden>
  <div class="bar"><span id="cnt"></span></div><div class="list" id="list"></div></div>
  <div class="panel"><h2>${t('mrgTitle')}</h2>
  <label>${t('fname')}<input id="name" value="${esc(name)}"></label>
  <div class="prog" hidden><i></i></div><div class="pt" hidden></div>
  <button class="btn pri" id="go">${t('merge')}</button><button class="btn" id="stop" hidden>${t('cancel')}</button></div></div>`;
  const prog=progress(root);
  const upd=()=>{$('#cnt',root).textContent=items.length?t('files',{n:items.length}):'';$('#go',root).disabled=busy||items.length<2};
  const draw=sortableList($('#list',root),items,{
    row:it=>`<div class="meta"><b>${esc(it.file.name)}</b><small>${t('pages',{n:it.pages})} · ${fmt(it.file.size)}</small></div>`,onChange:upd});
  dropzone($('#dz',root),$('#fi',root),f=>addFiles(f,draw,upd));
  $('#name',root).oninput=e=>{name=e.target.value};
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#go',root).onclick=async()=>{
    if(busy)return;busy=true;upd();$('#stop',root).hidden=false;prog.show(true);
    try{const {bytes,pages}=await (cur=task('merge',{files:items.map(i=>i.file)},{onProgress:prog.set})).promise,
        n=safeName(name),blob=new Blob([bytes],{type:'application/pdf'});
      showResult({blob,name:n,pages})}
    catch(e){e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}
    finally{busy=false;prog.show(false);$('#stop',root).hidden=true;upd()}
  };
  draw();upd();
}
