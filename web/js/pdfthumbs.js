// PDF.js helpers: lazy thumbnail grid shared by Organize and Extract.
import {t} from './i18n.js';
import {esc} from './ui.js';
import {task} from './worker.js';
pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';
export async function openPdf(file){
  if(!file.size)throw new Error(t('emptyF',{f:file.name}));
  try{return await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise}
  catch(e){throw new Error(e.name==='PasswordException'?t('encPdf',{f:file.name}):t('badPdf',{f:file.name}))}
}
// pages: [{i (0-based original index), rot, sel}]. Thumbnails render only when scrolled near, and are cached by page index.
export function grid(host,pdf,pages,{card='',drag=false,onChange=()=>{},onAct=()=>{}}={}){
  const cache=new Map(),io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){io.unobserve(e.target);paint(e.target)}}),{rootMargin:'300px'});
  async function paint(img){const i=+img.dataset.i;
    if(!cache.has(i)){const pg=await pdf.getPage(i+1),v0=pg.getViewport({scale:1}),v=pg.getViewport({scale:Math.min(2,170*devicePixelRatio/v0.width)});
      const cv=document.createElement('canvas');cv.width=v.width;cv.height=v.height;
      await pg.render({canvasContext:cv.getContext('2d'),viewport:v}).promise;pg.cleanup();
      cache.set(i,URL.createObjectURL(await new Promise(r=>cv.toBlob(r,'image/jpeg',.7))));cv.width=cv.height=0}
    img.src=cache.get(i)}
  let from=-1;
  function draw(){io.disconnect();
    host.innerHTML=pages.map((p,k)=>`<div class="card${p.sel?' on':''}" data-k="${k}" ${drag?'draggable="true"':''}><div class="th"><img data-i="${p.i}" alt="${esc(t('page',{n:p.i+1}))}" style="transform:rotate(${p.rot||0}deg)"></div>
    <div class="cf"><input type="checkbox" data-act="sel" aria-label="${esc(t('page',{n:p.i+1}))}" ${p.sel?'checked':''}><span>${p.i+1}</span>${card}</div></div>`).join('');
    host.querySelectorAll('img').forEach(i=>io.observe(i))}
  host.onclick=e=>{const b=e.target.closest('[data-act]'),c=e.target.closest('.card');if(!c)return;const k=+c.dataset.k;
    if(!b||b.dataset.act==='sel'){pages[k].sel=b?b.checked:!pages[k].sel;c.classList.toggle('on',pages[k].sel);c.querySelector('input').checked=pages[k].sel;onChange()}
    else{onAct(b.dataset.act,k);draw();onChange()}};
  host.ondragstart=e=>{const c=e.target.closest('.card');if(c)from=+c.dataset.k};
  host.ondragover=e=>{if(from>=0&&e.target.closest('.card'))e.preventDefault()};
  host.ondrop=e=>{const c=e.target.closest('.card');if(c&&from>=0){e.preventDefault();pages.splice(+c.dataset.k,0,pages.splice(from,1)[0]);draw();onChange()}from=-1};
  draw();
  return{draw,destroy(){io.disconnect();cache.forEach(u=>URL.revokeObjectURL(u));cache.clear();host.innerHTML=''}};
}
// Export [{i,rot}] as a new PDF in the worker; returns a cancellable task handle.
export const exportTask=(file,list,onProgress)=>task('export',{file,list},{onProgress});
