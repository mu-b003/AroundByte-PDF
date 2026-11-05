// PDF.js helpers: cancellable document loading and lazy thumbnail rendering.
import {t} from './i18n.js';
import {esc} from './ui.js';
import {task} from './worker.js';

pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';

const abortError=()=>new DOMException('The operation was aborted','AbortError');

export async function openPdf(file,{signal}={}){
  if(!file.size)throw new Error(t('emptyF',{f:file.name}));
  if(signal?.aborted)throw abortError();

  let loadingTask;
  const onAbort=()=>{try{void Promise.resolve(loadingTask?.destroy?.()).catch(()=>{})}catch{}};
  try{
    const data=new Uint8Array(await file.arrayBuffer());
    if(signal?.aborted)throw abortError();
    loadingTask=pdfjsLib.getDocument({data});
    signal?.addEventListener('abort',onAbort,{once:true});
    const pdf=await loadingTask.promise;
    if(signal?.aborted){await pdf.destroy();throw abortError()}
    return pdf;
  }catch(e){
    if(e?.name==='AbortError'||signal?.aborted)throw abortError();
    throw new Error(e?.name==='PasswordException'?t('encPdf',{f:file.name}):t('badPdf',{f:file.name}));
  }finally{
    signal?.removeEventListener('abort',onAbort);
  }
}

// pages: [{i (0-based original index), rot, sel}]. Thumbnails render on demand.
export function grid(host,pdf,pages,{card='',drag=false,onChange=()=>{},onAct=()=>{}}={}){
  const cache=new Map(),pending=new Map(),renderTasks=new Set();
  let destroyed=false,from=-1;
  const io=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting||destroyed)continue;
      io.unobserve(entry.target);
      void paint(entry.target);
    }
  },{rootMargin:'300px'});

  async function paint(img){
    const i=Number(img.dataset.i);
    if(destroyed||!Number.isInteger(i)||i<0)return;
    try{
      let url=cache.get(i);
      if(!url){
        let work=pending.get(i);
        if(!work){
          work=(async()=>{
            let page=null,canvas=null,renderTask=null;
            try{
              page=await pdf.getPage(i+1);
              if(destroyed)return null;
              const base=page.getViewport({scale:1});
              const viewport=page.getViewport({scale:Math.min(2,170*devicePixelRatio/base.width)});
              canvas=document.createElement('canvas');
              canvas.width=Math.ceil(viewport.width);
              canvas.height=Math.ceil(viewport.height);
              renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport});
              renderTasks.add(renderTask);
              await renderTask.promise;
              if(destroyed)return null;
              const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.7));
              if(!blob)throw new Error('Thumbnail encoding failed');
              if(destroyed)return null;
              const objectUrl=URL.createObjectURL(blob);
              if(destroyed){URL.revokeObjectURL(objectUrl);return null}
              cache.set(i,objectUrl);
              return objectUrl;
            }finally{
              if(renderTask)renderTasks.delete(renderTask);
              try{page?.cleanup?.()}catch{}
              if(canvas){canvas.width=0;canvas.height=0}
            }
          })();
          pending.set(i,work);
        }
        try{url=await work}finally{if(pending.get(i)===work)pending.delete(i)}
      }
      if(url&&!destroyed&&img.isConnected)img.src=url;
    }catch(error){
      if(!destroyed){img.dataset.error='true';console.warn('PDF thumbnail failed:',error)}
    }
  }

  function draw(){
    if(destroyed)return;
    io.disconnect();
    host.innerHTML=pages.map((p,k)=>`<div class="card${p.sel?' on':''}" data-k="${k}" ${drag?'draggable="true"':''}><div class="th"><img data-i="${p.i}" alt="${esc(t('page',{n:p.i+1}))}" style="transform:rotate(${p.rot||0}deg)"></div>
      <div class="cf"><input type="checkbox" data-act="sel" aria-label="${esc(t('page',{n:p.i+1}))}" ${p.sel?'checked':''}><span>${p.i+1}</span>${card}</div></div>`).join('');
    host.querySelectorAll('img').forEach(img=>io.observe(img));
  }

  const onClick=e=>{
    const button=e.target.closest('[data-act]'),item=e.target.closest('.card');
    if(!item||destroyed)return;
    const index=Number(item.dataset.k);
    if(!button||button.dataset.act==='sel'){
      pages[index].sel=button?button.checked:!pages[index].sel;
      item.classList.toggle('on',pages[index].sel);
      item.querySelector('input').checked=pages[index].sel;
      onChange();
    }else{
      onAct(button.dataset.act,index);
      draw();
      onChange();
    }
  };
  const onDragStart=e=>{const item=e.target.closest('.card');if(item&&!destroyed)from=Number(item.dataset.k)};
  const onDragOver=e=>{if(!destroyed&&from>=0&&e.target.closest('.card'))e.preventDefault()};
  const onDrop=e=>{
    const item=e.target.closest('.card');
    if(!destroyed&&item&&from>=0){
      e.preventDefault();
      const to=Number(item.dataset.k);
      if(to!==from)pages.splice(to,0,pages.splice(from,1)[0]);
      draw();onChange();
    }
    from=-1;
  };

  host.addEventListener('click',onClick);
  host.addEventListener('dragstart',onDragStart);
  host.addEventListener('dragover',onDragOver);
  host.addEventListener('drop',onDrop);
  draw();

  return{
    draw,
    destroy(){
      if(destroyed)return;
      destroyed=true;
      io.disconnect();
      for(const renderTask of renderTasks){try{renderTask.cancel()}catch{}}
      renderTasks.clear();pending.clear();
      for(const url of cache.values())URL.revokeObjectURL(url);
      cache.clear();
      host.removeEventListener('click',onClick);
      host.removeEventListener('dragstart',onDragStart);
      host.removeEventListener('dragover',onDragOver);
      host.removeEventListener('drop',onDrop);
      host.innerHTML='';
    }
  };
}

// Export [{i,rot}] as a cancellable worker task.
export const exportTask=(file,list,onProgress)=>task('export',{file,list},{onProgress});
