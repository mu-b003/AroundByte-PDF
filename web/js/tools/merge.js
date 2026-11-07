import {t} from '../i18n.js';
import {$,esc,fmt,toast,dropzone,sortableList,safeName,showResult,ICON,progress} from '../ui.js';
import {task,explain} from '../worker.js';
export const id='merge',titleKey='mrgTitle',descKey='mrgDesc',icon=ICON.merge;
const items=[],inspections=new Set();let name='merged',busy=false,cur=null,generation=0;
async function addFiles(files,draw,upd,token){
  for(const f of files){
    if(token!==generation)return;
    const inspection=task('inspect',{file:f});
    inspections.add(inspection);
    try{
      const pages=await inspection.promise;
      if(token!==generation)return;
      items.push({file:f,pages});
    }catch(e){
      if(token===generation&&e!=='cancel')toast(explain(e),'err');
    }finally{inspections.delete(inspection)}
  }
  if(token!==generation)return;
  draw();upd();
}
export function mount(root){
  const token=generation;
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
  dropzone($('#dz',root),$('#fi',root),f=>addFiles(f,draw,upd,token));
  $('#name',root).oninput=e=>{name=e.target.value};
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#go',root).onclick=async()=>{
    if(token!==generation||busy)return;busy=true;upd();$('#stop',root).hidden=false;prog.show(true);
    try{const {bytes,pages}=await (cur=task('merge',{files:items.map(i=>i.file)},{onProgress:prog.set})).promise,
        n=safeName(name),blob=new Blob([bytes],{type:'application/pdf'});
      showResult({blob,name:n,pages,operation:'op_merge'})}
    catch(e){e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}
    finally{
      if(token===generation){cur=null;busy=false;prog.show(false);$('#stop',root).hidden=true;upd()}
    }
  };
  draw();upd();
}

export function unmount({preserveState=false}={}){
  generation++;
  cur?.cancel();cur=null;
  for(const inspection of inspections)inspection.cancel();
  inspections.clear();
  busy=false;
  if(!preserveState){items.length=0;name='merged'}
}
