import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {explain} from '../worker.js';
import {openPdf,grid,exportTask} from '../pdfthumbs.js';
export const id='extract',titleKey='extTitle',descKey='extDesc',icon=ICON.extract;
let cur=null,st=null,name='extracted',range='',busy=false,generation=0,loadController=null;

// "1-3, 5, 8-10" -> sorted unique 0-based indices, or throws with the offending token.
export function parseRanges(s,n){
  const out=new Set();
  for(const token of s.split(/[,;\s]+/).filter(Boolean)){
    const match=/^(\d+)(?:-(\d+))?$/.exec(token);
    const first=match&&+match[1],last=match&&(match[2]?+match[2]:+match[1]);
    if(!match||first<1||last>n||first>last)throw new Error(t('rangeErr',{r:token,n}));
    for(let i=first;i<=last;i++)out.add(i-1);
  }
  return[...out].sort((a,b)=>a-b);
}

function dispose({preserveState=false}={}){
  generation++;
  loadController?.abort();loadController=null;
  cur?.cancel();cur=null;busy=false;
  if(st){
    st.g?.destroy();st.g=null;
    if(!preserveState){void Promise.resolve(st.pdf?.destroy?.()).catch(()=>{});st=null}
  }
  if(!preserveState){name='extracted';range=''}
}

export function mount(root){
  const token=++generation;
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button></div>
  <div class="grid" id="grid"></div></div>
  <div class="panel"><h2>${t('extTitle')}</h2><label>${t('rangeLbl')}<input id="rg" placeholder="${t('rangeHint')}" value="${esc(range)}"></label><div class="pt" id="err" style="color:var(--err)"></div>
  <label>${t('fname')}<input id="name" value="${esc(name)}"></label><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go">${t('extractBtn')}</button></div></div>`;
  const current=()=>token===generation;
  const upd=()=>{if(!current())return;const count=st?st.pages.filter(page=>page.sel).length:0;$('#cnt',root).textContent=st?t('nSel',{n:count}):'';$('#go',root).disabled=busy||!count};
  const show=()=>{if(!current()||!st)return;st.g?.destroy();st.g=grid($('#grid',root),st.pdf,st.pages,{onChange:upd})};
  const load=async([file])=>{
    if(!file||!current())return;
    loadController?.abort();cur?.cancel();cur=null;busy=false;upd();
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
  $('#rg',root).oninput=e=>{
    range=e.target.value;
    if(!st)return;
    try{const indices=new Set(parseRanges(range,st.pages.length));st.pages.forEach(page=>page.sel=indices.has(page.i));$('#err',root).textContent='';st.g?.draw();upd()}
    catch(error){$('#err',root).textContent=error.message}
  };
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#name',root).oninput=e=>name=e.target.value;
  const all=value=>{st?.pages.forEach(page=>page.sel=value);st?.g?.draw();upd()};
  $('#sa',root).onclick=()=>all(true);$('#sn',root).onclick=()=>all(false);
  $('#go',root).onclick=async()=>{
    if(!current()||busy||!st)return;
    const state=st,list=state.pages.filter(page=>page.sel).map(page=>({...page})).sort((a,b)=>a.i-b.i);
    if(!list.length)return;
    busy=true;upd();$('#stop',root).hidden=false;
    const operation=exportTask(state.file,list);cur=operation;
    try{
      const {bytes}=await operation.promise;
      if(!current()||st!==state)return;
      showResult({blob:new Blob([bytes],{type:'application/pdf'}),name:safeName(name),pages:list.length});
    }catch(error){if(current())error==='cancel'?toast(t('cancelled')):toast(explain(error),'err')}
    finally{if(current()&&cur===operation){cur=null;busy=false;$('#stop',root).hidden=true;upd()}}
  };
  if(st)show();upd();
}

export function unmount(options){dispose(options)}
