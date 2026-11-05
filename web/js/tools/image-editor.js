import {t} from '../i18n.js';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function transformCanvas(source,kind){
  const w=source.width,h=source.height;
  const rotate=kind==='cw'||kind==='ccw';
  const out=document.createElement('canvas');
  out.width=rotate?h:w;
  out.height=rotate?w:h;
  const g=out.getContext('2d');

  if(kind==='cw'){
    g.translate(out.width,0);
    g.rotate(Math.PI/2);
  }else if(kind==='ccw'){
    g.translate(0,out.height);
    g.rotate(-Math.PI/2);
  }else if(kind==='flipH'){
    g.translate(w,0);
    g.scale(-1,1);
  }else if(kind==='flipV'){
    g.translate(0,h);
    g.scale(1,-1);
  }

  g.drawImage(source,0,0);
  return out;
}

function transformCrop(c,W,H,kind){
  const {x,y,w,h}=c;
  if(kind==='cw')return{x:H-y-h,y:x,w:h,h:w};
  if(kind==='ccw')return{x:y,y:W-x-w,w:h,h:w};
  if(kind==='flipH')return{x:W-x-w,y,w,h};
  if(kind==='flipV')return{x,y:H-y-h,w,h};
  return c;
}

export async function editImage(file,{signal}={}){
  let source;
  try{
    source=await createImageBitmap(file);
  }catch{
    throw new Error('image-open');
  }

  if(signal?.aborted){source.close();throw new DOMException('The operation was aborted','AbortError')}

  let canvas=document.createElement('canvas');
  try{
    canvas.width=source.width;
    canvas.height=source.height;
    const context=canvas.getContext('2d');
    if(!context)throw new Error('Canvas is unavailable');
    context.drawImage(source,0,0);
  }finally{source.close()}
  const originalCanvas=canvas;

  let crop={x:0,y:0,w:canvas.width,h:canvas.height};
  let result=null;
  let pointer=null;

  const dlg=document.createElement('dialog');
  dlg.className='abie-dialog';
  dlg.innerHTML=`
    <div class="abie-head">
      <b>${t('editImage')}</b>
      <span class="abie-filename"></span>
      <button class="btn ghost" type="button" data-close>${t('close')}</button>
    </div>
    <div class="abie-body">
      <div class="abie-stage-wrap">
        <div class="abie-stage">
          <canvas></canvas>
          <div class="abie-crop">
            ${['nw','n','ne','e','se','s','sw','w'].map(k=>`<i data-handle="${k}"></i>`).join('')}
          </div>
        </div>
      </div>
      <div class="abie-controls">
        <div class="abie-tools">
          <button class="btn" type="button" data-turn="ccw">${t('turnLeft')}</button>
          <button class="btn" type="button" data-turn="cw">${t('turnRight')}</button>
          <button class="btn" type="button" data-turn="flipH">${t('flipH')}</button>
          <button class="btn" type="button" data-turn="flipV">${t('flipV')}</button>
          <button class="btn ghost" type="button" data-reset>${t('resetImage')}</button>
        </div>
        <p>${t('cropHint')}</p>
        <div class="abie-footer">
          <button class="btn" type="button" data-close>${t('cancel')}</button>
          <button class="btn pri" type="button" data-apply>${t('applyImage')}</button>
        </div>
      </div>
    </div>`;

  const stage=dlg.querySelector('.abie-stage');
  const view=dlg.querySelector('canvas');
  const cropEl=dlg.querySelector('.abie-crop');
  const filename=dlg.querySelector('.abie-filename');
  filename.textContent=file.name;

  const ctx=view.getContext('2d');
  let displayScale=1;

  function render(){
    const maxW=Math.min(760,window.innerWidth-48);
    const maxH=Math.max(180,window.innerHeight*.53);
    displayScale=Math.min(maxW/canvas.width,maxH/canvas.height,1);
    const dw=Math.max(1,Math.round(canvas.width*displayScale));
    const dh=Math.max(1,Math.round(canvas.height*displayScale));

    view.width=canvas.width;
    view.height=canvas.height;
    view.style.width=dw+'px';
    view.style.height=dh+'px';
    stage.style.width=dw+'px';
    stage.style.height=dh+'px';
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(canvas,0,0);

    cropEl.style.left=(crop.x*displayScale)+'px';
    cropEl.style.top=(crop.y*displayScale)+'px';
    cropEl.style.width=(crop.w*displayScale)+'px';
    cropEl.style.height=(crop.h*displayScale)+'px';
  }

  function close(value){
    if(!dlg.open)return;
    result=value;
    dlg.close();
  }
  const onAbort=()=>close(null);

  dlg.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(null));

  dlg.querySelectorAll('[data-turn]').forEach(b=>{
    b.onclick=()=>{
      const kind=b.dataset.turn;
      const oldW=canvas.width,oldH=canvas.height;
      crop=transformCrop(crop,oldW,oldH,kind);
      const previous=canvas;
      canvas=transformCanvas(previous,kind);
      if(previous!==originalCanvas){previous.width=previous.height=0}
      render();
    };
  });

  dlg.querySelector('[data-reset]').onclick=()=>{
    canvas=originalCanvas;
    crop={x:0,y:0,w:canvas.width,h:canvas.height};
    render();
  };

  cropEl.addEventListener('pointerdown',e=>{
    e.preventDefault();
    const handle=e.target.closest('[data-handle]')?.dataset.handle||'move';
    pointer={
      id:e.pointerId,
      handle,
      x:e.clientX,
      y:e.clientY,
      crop:{...crop}
    };
    cropEl.setPointerCapture(e.pointerId);
  });

  cropEl.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    const dx=(e.clientX-pointer.x)/displayScale;
    const dy=(e.clientY-pointer.y)/displayScale;
    const c=pointer.crop;
    const min= Math.min(12,canvas.width,canvas.height);

    let left=c.x,right=c.x+c.w,top=c.y,bottom=c.y+c.h;
    const h=pointer.handle;

    if(h==='move'){
      const x=clamp(c.x+dx,0,canvas.width-c.w);
      const y=clamp(c.y+dy,0,canvas.height-c.h);
      crop={x,y,w:c.w,h:c.h};
      render();
      return;
    }

    if(h.includes('w'))left=clamp(c.x+dx,0,right-min);
    if(h.includes('e'))right=clamp(c.x+c.w+dx,left+min,canvas.width);
    if(h.includes('n'))top=clamp(c.y+dy,0,bottom-min);
    if(h.includes('s'))bottom=clamp(c.y+c.h+dy,top+min,canvas.height);

    crop={x:left,y:top,w:right-left,h:bottom-top};
    render();
  });

  const stopPointer=()=>{pointer=null};
  cropEl.addEventListener('pointerup',stopPointer);
  cropEl.addEventListener('pointercancel',stopPointer);

  dlg.querySelector('[data-apply]').onclick=()=>{
    const x=Math.max(0,Math.floor(crop.x));
    const y=Math.max(0,Math.floor(crop.y));
    const right=Math.min(canvas.width,Math.ceil(crop.x+crop.w));
    const bottom=Math.min(canvas.height,Math.ceil(crop.y+crop.h));
    const w=right-x,h=bottom-y;

    if(w<1||h<1)return;

    const out=document.createElement('canvas');
    out.width=w;
    out.height=h;
    out.getContext('2d').drawImage(canvas,x,y,w,h,0,0,w,h);
    out.toBlob(blob=>{
      out.width=out.height=0;
      if(!blob||signal?.aborted)return;
      close(new File([blob],file.name,{type:'image/png',lastModified:Date.now()}));
    },'image/png');
  };

  return new Promise(resolve=>{
    dlg.addEventListener('close',()=>{
      signal?.removeEventListener('abort',onAbort);
      dlg.remove();
      canvas.width=canvas.height=0;
      if(originalCanvas!==canvas)originalCanvas.width=originalCanvas.height=0;
      view.width=view.height=0;
      resolve(result);
    },{once:true});

    signal?.addEventListener('abort',onAbort,{once:true});
    document.body.appendChild(dlg);
    dlg.showModal();
    if(signal?.aborted)close(null);
    else render();
  });
}
