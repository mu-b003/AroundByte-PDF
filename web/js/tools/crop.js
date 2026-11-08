import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult} from '../ui.js';
import {openPdf} from '../pdfthumbs.js';
import {task,explain} from '../worker.js';

let source=null,pdf=null,base='document',outputName='document-cropped',busy=false,job=null,loadController=null,generation=0,runToken=0;
let frame={left:8,top:8,right:92,bottom:92},previewRenderTask=null;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function dispose({preserveState=false}={}){
  generation++;runToken++;
  loadController?.abort();loadController=null;
  job?.cancel();job=null;busy=false;
  try{previewRenderTask?.cancel()}catch{}previewRenderTask=null;
  if(!preserveState&&pdf){void Promise.resolve(pdf.destroy?.()).catch(()=>{});pdf=null}
  if(!preserveState){source=null;base='document';outputName='document-cropped';frame={left:8,top:8,right:92,bottom:92}}
}

export const id='crop',titleKey='cropTitle',descKey='cropDesc',icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v14a4 4 0 0 0 4 4h10M3 7h14a4 4 0 0 1 4 4v10"/><path d="M7 7h10v10"/></svg>';

export function mount(root){
  const token=++generation,current=()=>token===generation;
  root.innerHTML=`<div class="work crop-work"><div>
    <div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input id="fi" type="file" accept="application/pdf,.pdf" hidden>
    <div class="bar"><span id="fileInfo"></span><span class="sp"></span><span id="pageInfo"></span></div>
    <div class="crop-stage" id="stage" hidden><canvas id="preview"></canvas><div class="crop-frame" id="frame" role="group" aria-label="${t('cropFrame')}"><i data-edge="nw"></i><i data-edge="n"></i><i data-edge="ne"></i><i data-edge="e"></i><i data-edge="se"></i><i data-edge="s"></i><i data-edge="sw"></i><i data-edge="w"></i></div></div>
    <p class="pt">${t('cropDragHint')}</p>
  </div><div class="panel"><h2>${t('cropTitle')}</h2>
    <p class="pt">${t('cropAllPagesNote')}</p>
    <div class="two"><label>${t('cropLeft')} (%)<input id="left" type="number" min="0" max="45" step="0.5" value="8"></label><label>${t('cropTop')} (%)<input id="top" type="number" min="0" max="45" step="0.5" value="8"></label><label>${t('cropRight')} (%)<input id="right" type="number" min="55" max="100" step="0.5" value="92"></label><label>${t('cropBottom')} (%)<input id="bottom" type="number" min="55" max="100" step="0.5" value="92"></label></div>
    <label>${t('fname')}<input id="name" value="${esc(outputName)}"></label>
    <button class="btn ghost" id="reset" type="button">${t('cropReset')}</button>
    <button class="btn pri" id="go" disabled>${t('cropApply')}</button>
  </div></div>`;
  const $r=s=>$(s,root),canvas=$r('#preview'),ctx=canvas.getContext('2d');
  let drag=null,viewport=null;
  const syncInputs=()=>{for(const key of ['left','top','right','bottom'])$r('#'+key).value=Number(frame[key].toFixed(1))};
  const valid=()=>frame.left>=0&&frame.top>=0&&frame.right<=100&&frame.bottom<=100&&frame.right-frame.left>=10&&frame.bottom-frame.top>=10;
  const update=()=>{if(!current())return;const f=$r('#frame');f.style.left=frame.left+'%';f.style.top=frame.top+'%';f.style.width=(frame.right-frame.left)+'%';f.style.height=(frame.bottom-frame.top)+'%';$r('#go').disabled=!source||busy||!valid()};
  const setFrame=(next)=>{frame={left:clamp(next.left,0,89),top:clamp(next.top,0,89),right:clamp(next.right,11,100),bottom:clamp(next.bottom,11,100)};if(frame.right-frame.left<10)frame.right=frame.left+10;if(frame.bottom-frame.top<10)frame.bottom=frame.top+10;syncInputs();update()};
  const renderPreview=async()=>{
    if(!pdf||!current())return;
    let rendering=null;
    try{
      const page=await pdf.getPage(1);if(!current())return;
      const scale=Math.min(1.5,900/page.getViewport({scale:1}).width);
      viewport=page.getViewport({scale});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      $r('#stage').style.aspectRatio=`${viewport.width}/${viewport.height}`;
      rendering=page.render({canvasContext:ctx,viewport});previewRenderTask=rendering;await rendering.promise;if(previewRenderTask===rendering)previewRenderTask=null;page.cleanup?.();
      if(current()){$r('#stage').hidden=false;update()}
    }catch(error){if(previewRenderTask===rendering)previewRenderTask=null;if(current()&&error?.name!=='RenderingCancelledException')toast(t('renderFailed'),'err')}
  };
  dropzone($r('#dz'),$r('#fi'),async files=>{
    const file=files.find(x=>x.type==='application/pdf'||x.name.toLowerCase().endsWith('.pdf'));if(!file){if(files[0])toast(t('badPdf',{f:files[0].name}),'err');return}
    runToken++;loadController?.abort();job?.cancel();job=null;busy=false;try{previewRenderTask?.cancel()}catch{}previewRenderTask=null;
    const controller=new AbortController();loadController=controller;
    try{
      const opened=await openPdf(file,{signal:controller.signal});
      if(!current()||controller.signal.aborted){await opened.destroy();return}
      if(pdf)await pdf.destroy();pdf=opened;source=file;base=safeName(file.name);outputName=base+'-cropped';
      $r('#fileInfo').textContent=file.name;$r('#pageInfo').textContent=t('pages',{n:pdf.numPages});$r('#name').value=outputName;
      setFrame({left:8,top:8,right:92,bottom:92});await renderPreview();
    }catch(error){if(current()&&error?.name!=='AbortError')toast(error.message,'err')}
    finally{if(loadController===controller)loadController=null;update()}
  });
  for(const key of ['left','top','right','bottom'])$r('#'+key).oninput=e=>{const n=Number(e.target.value);if(!Number.isFinite(n))return;const next={...frame,[key]:clamp(n,0,100)};if(next.right-next.left<10||next.bottom-next.top<10){e.target.value=frame[key];return}frame=next;update()};
  $r('#name').oninput=e=>outputName=e.target.value;
  $r('#reset').onclick=()=>setFrame({left:0,top:0,right:100,bottom:100});
  const point=e=>{const r=$r('#stage').getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width*100,0,100),y:clamp((e.clientY-r.top)/r.height*100,0,100)}};
  $r('#frame').addEventListener('pointerdown',e=>{
    if(!source||busy)return;const edge=e.target.dataset.edge||'move',p=point(e);drag={edge,start:p,initial:{...frame}};e.currentTarget.setPointerCapture(e.pointerId);e.preventDefault();
  });
  $r('#frame').addEventListener('pointermove',e=>{
    if(!drag)return;const p=point(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y,n={...drag.initial},edge=drag.edge;
    if(edge==='move'){const w=n.right-n.left,h=n.bottom-n.top;n.left=clamp(n.left+dx,0,100-w);n.right=n.left+w;n.top=clamp(n.top+dy,0,100-h);n.bottom=n.top+h}
    else{if(edge.includes('w'))n.left=clamp(n.left+dx,0,n.right-10);if(edge.includes('e'))n.right=clamp(n.right+dx,n.left+10,100);if(edge.includes('n'))n.top=clamp(n.top+dy,0,n.bottom-10);if(edge.includes('s'))n.bottom=clamp(n.bottom+dy,n.top+10,100)}
    frame=n;syncInputs();update();
  });
  const stopDrag=()=>drag=null;$r('#frame').addEventListener('pointerup',stopDrag);$r('#frame').addEventListener('pointercancel',stopDrag);
  $r('#go').onclick=async()=>{
    if(!current()||!source||busy||!valid())return;const run=++runToken;busy=true;update();
    try{
      const boxes=[];
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);if(!current()||run!==runToken)return;
        const vp=page.getViewport({scale:1}),x1=vp.width*frame.left/100,y1=vp.height*frame.top/100,x2=vp.width*frame.right/100,y2=vp.height*frame.bottom/100;
        const pts=[vp.convertToPdfPoint(x1,y1),vp.convertToPdfPoint(x2,y1),vp.convertToPdfPoint(x2,y2),vp.convertToPdfPoint(x1,y2)];
        const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
        boxes.push({index:i-1,x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)});
        page.cleanup?.();
      }
      if(!current()||run!==runToken)return;
      const operation=task('crop',{file:source,boxes});job=operation;
      const result=await operation.promise;
      if(current())showResult({blob:new Blob([result.bytes],{type:'application/pdf'}),name:safeName(outputName),pages:result.pages,operation:'op_crop'});
    }catch(error){if(current()&&run===runToken&&error!=='cancel')toast(explain(error),'err')}
    finally{if(current()&&run===runToken){busy=false;job=null;update()}}
  };
  if(source&&pdf){$r('#fileInfo').textContent=source.name;$r('#pageInfo').textContent=t('pages',{n:pdf.numPages});$r('#name').value=outputName;syncInputs();void renderPreview()}
  update();
}
export function unmount(options){dispose(options)}
