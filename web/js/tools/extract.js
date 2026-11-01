import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {explain} from '../worker.js';
import {openPdf,grid,exportTask} from '../pdfthumbs.js';
export const id='extract',titleKey='extTitle',descKey='extDesc',icon=ICON.extract;
let cur=null,st=null,name='extracted',range='',busy=false;
// "1-3, 5, 8-10" -> sorted unique 0-based indices, or throws with the offending token
export function parseRanges(s,n){const out=new Set();
  for(const tok of s.split(/[,;\s]+/).filter(Boolean)){const m=/^(\d+)(?:-(\d+))?$/.exec(tok);
    const a=m&&+m[1],b=m&&(m[2]?+m[2]:+m[1]);
    if(!m||a<1||b>n||a>b)throw new Error(t('rangeErr',{r:tok,n}));for(let i=a;i<=b;i++)out.add(i-1)}
  return[...out].sort((x,y)=>x-y)}
export function mount(root){
  root.innerHTML=`<div class="work"><div>
  <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden>
  <div class="bar"><span id="cnt"></span><span class="sp"></span><button class="btn ghost" id="sa">${t('selAll')}</button><button class="btn ghost" id="sn">${t('selNone')}</button></div>
  <div class="grid" id="grid"></div></div>
  <div class="panel"><h2>${t('extTitle')}</h2><label>${t('rangeLbl')}<input id="rg" placeholder="${t('rangeHint')}" value="${esc(range)}"></label><div class="pt" id="err" style="color:var(--err)"></div>
  <label>${t('fname')}<input id="name" value="${esc(name)}"></label><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go">${t('extractBtn')}</button></div></div>`;
  const upd=()=>{const n=st?st.pages.filter(p=>p.sel).length:0;$('#cnt',root).textContent=st?t('nSel',{n}):'';$('#go',root).disabled=busy||!n};
  const show=()=>st.g=grid($('#grid',root),st.pdf,st.pages,{onChange:upd});
  const load=async([f])=>{if(!f)return;try{const pdf=await openPdf(f);st?.g.destroy();st?.pdf.destroy();
    st={file:f,pdf,pages:Array.from({length:pdf.numPages},(_,i)=>({i,rot:0,sel:false}))};show()}catch(e){toast(e.message,'err')}upd()};
  dropzone($('#dz',root),$('#fi',root),load);
  $('#rg',root).oninput=e=>{range=e.target.value;if(!st)return;
    try{const idx=new Set(parseRanges(range,st.pages.length));st.pages.forEach(p=>p.sel=idx.has(p.i));$('#err',root).textContent='';st.g.draw();upd()}
    catch(x){$('#err',root).textContent=x.message}};
  $('#stop',root).onclick=()=>cur?.cancel();
  $('#name',root).oninput=e=>name=e.target.value;
  const all=v=>{st?.pages.forEach(p=>p.sel=v);st?.g.draw();upd()};
  $('#sa',root).onclick=()=>all(true);$('#sn',root).onclick=()=>all(false);
  $('#go',root).onclick=async()=>{if(busy)return;busy=true;upd();$('#stop',root).hidden=false;
    try{const list=st.pages.filter(p=>p.sel).sort((a,b)=>a.i-b.i),{bytes}=await (cur=exportTask(st.file,list)).promise,n=safeName(name),blob=new Blob([bytes],{type:'application/pdf'});
      showResult({blob,name:n,pages:list.length})}
    catch(e){e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}finally{busy=false;$('#stop',root).hidden=true;upd()}};
  if(st)show();upd();
}
