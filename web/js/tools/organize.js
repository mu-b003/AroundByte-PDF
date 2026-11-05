import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {explain} from '../worker.js';
import {openPdf,grid,exportTask} from '../pdfthumbs.js';
export const id='organize',titleKey='orgTitle',descKey='orgDesc',icon=ICON.grid;
let cur=null,st=null,name='organized',busy=false,generation=0,loadController=null;

function dispose({preserveState=false}={}){
  generation++;
  loadController?.abort();loadController=null;
  cur?.cancel();cur=null;busy=false;
  if(st){
    st.g?.destroy();st.g=null;
    if(!preserveState){void Promise.resolve(st.pdf?.destroy?.()).catch(()=>{});st=null}
  }
  if(!preserveState){name='organized'}
}

export function mount(root){
  const token=++generation;
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button><button class="btn" id="del">${t('delSel')}</button></div>
  <div class="grid" id="grid"></div></div>
  <div class="panel"><h2>${t('orgTitle')}</h2><label>${t('fname')}<input id="name" value="${esc(name)}"></label>
  <button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go">${t('exportPdf')}</button><div class="pt" id="pt" hidden></div></div></div>`;
  const current=()=>token===generation;
  const upd=()=>{if(!current())return;const n=st?st.pages.filter(p=>p.sel).length:0;$('#cnt',root).textContent=st?t('selected',{n,m:st.pages.length}):'';
    $('#del',root).disabled=!n;$('#go',root).disabled=busy||!st};
  const show=()=>{if(!current()||!st)return;st.g?.destroy();st.g=grid($('#grid',root),st.pdf,st.pages,{drag:true,onChange:upd,
    card:`<button class="icon" data-act="rot" title="${t('rotate')}" aria-label="${t('rotate')}">${ICON.rot}</button>`,
    onAct:(action,index)=>{if(action==='rot')st.pages[index].rot=((st.pages[index].rot||0)+90)%360}})};
  const load=async([file])=>{
    if(!file||!current())return;
    loadController?.abort();
    cur?.cancel();cur=null;busy=false;upd();
    const controller=new AbortController();loadController=controller;
    try{
      const pdf=await openPdf(file,{signal:controller.signal});
      if(!current()||controller.signal.aborted){await pdf.destroy();return}
      if(st){st.g?.destroy();await st.pdf?.destroy?.()}
      if(!current()||controller.signal.aborted){await pdf.destroy();return}
      st={file,pdf,pages:Array.from({length:pdf.numPages},(_,i)=>({i,rot:0,sel:false})),g:null};
      show();
    }catch(error){if(current()&&error?.name!=='AbortError')toast(error.message,'err')}
    finally{if(loadController===controller)loadController=null;upd()}
  };
  dropzone($('#dz',root),$('#fi',root),load);
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#name',root).oninput=e=>name=e.target.value;
  const all=value=>{st?.pages.forEach(page=>page.sel=value);st?.g?.draw();upd()};
  $('#sa',root).onclick=()=>all(true);$('#sn',root).onclick=()=>all(false);
  $('#del',root).onclick=()=>{if(!st)return;const keep=st.pages.filter(page=>!page.sel);if(!keep.length)return toast(t('keepOne'),'err');
    if(!confirm(t('delSel')+'?'))return;st.pages=keep;show();upd()};
  $('#go',root).onclick=async()=>{
    if(!current()||busy||!st)return;
    const state=st,list=state.pages.map(page=>({...page}));
    busy=true;upd();$('#stop',root).hidden=false;const progress=$('#pt',root);progress.hidden=false;
    const operation=exportTask(state.file,list,(a,b)=>{if(current())progress.textContent=t('working',{a,b})});cur=operation;
    try{
      const {bytes}=await operation.promise;
      if(!current()||st!==state)return;
      showResult({blob:new Blob([bytes],{type:'application/pdf'}),name:safeName(name),pages:list.length});
    }catch(error){if(current())error==='cancel'?toast(t('cancelled')):toast(explain(error),'err')}
    finally{if(current()&&cur===operation){cur=null;busy=false;progress.hidden=true;$('#stop',root).hidden=true;upd()}}
  };
  if(st)show();upd();
}

export function unmount(options){dispose(options)}
