import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {explain} from '../worker.js';
import {openPdf,grid,exportTask} from '../pdfthumbs.js';
export const id='organize',titleKey='orgTitle',descKey='orgDesc',icon=ICON.grid;
let cur=null,st=null,name='organized',busy=false;   // st: {file,pdf,pages,g}
export function mount(root){
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button><button class="btn" id="del">${t('delSel')}</button></div>
  <div class="grid" id="grid"></div></div>
  <div class="panel"><h2>${t('orgTitle')}</h2><label>${t('fname')}<input id="name" value="${esc(name)}"></label>
  <button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go">${t('exportPdf')}</button><div class="pt" id="pt" hidden></div></div></div>`;
  const upd=()=>{const n=st?st.pages.filter(p=>p.sel).length:0;$('#cnt',root).textContent=st?t('selected',{n,m:st.pages.length}):'';
    $('#del',root).disabled=!n;$('#go',root).disabled=busy||!st};
  const show=()=>{st.g=grid($('#grid',root),st.pdf,st.pages,{drag:true,onChange:upd,
    card:`<button class="icon" data-act="rot" title="${t('rotate')}" aria-label="${t('rotate')}">${ICON.rot}</button>`,
    onAct:(a,k)=>{if(a==='rot')st.pages[k].rot=((st.pages[k].rot||0)+90)%360}})};
  const load=async([f])=>{if(!f)return;try{const pdf=await openPdf(f);st?.g.destroy();st?.pdf.destroy();
    st={file:f,pdf,pages:Array.from({length:pdf.numPages},(_,i)=>({i,rot:0,sel:false}))};show()}catch(e){toast(e.message,'err')}upd()};
  dropzone($('#dz',root),$('#fi',root),load);
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#name',root).oninput=e=>name=e.target.value;
  const all=v=>{st?.pages.forEach(p=>p.sel=v);st?.g.draw();upd()};
  $('#sa',root).onclick=()=>all(true);$('#sn',root).onclick=()=>all(false);
  $('#del',root).onclick=()=>{const keep=st.pages.filter(p=>!p.sel);if(!keep.length)return toast(t('keepOne'),'err');
    if(!confirm(t('delSel')+'?'))return;st.pages=keep;show();upd()};
  $('#go',root).onclick=async()=>{if(busy||!st)return;busy=true;upd();$('#stop',root).hidden=false;const pt=$('#pt',root);pt.hidden=false;
    try{const {bytes}=await (cur=exportTask(st.file,st.pages,(a,b)=>pt.textContent=t('working',{a,b}))).promise,n=safeName(name),blob=new Blob([bytes],{type:'application/pdf'});
      showResult({blob,name:n,pages:st.pages.length})}
    catch(e){e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}finally{busy=false;pt.hidden=true;$('#stop',root).hidden=true;upd()}};
  if(st)show();upd();
}
