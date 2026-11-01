import {t} from './i18n.js';
export const $=(s,r=document)=>r.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';
export const safeName=n=>(n||'').trim().replace(/\.pdf$/i,'').replace(/[\\/:*?"<>|]+/g,'_')||'aroundbyte';
const svg=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
export const ICON={image:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-9 9"/>'),
merge:svg('<path d="M6 3v6a6 6 0 0 0 6 6h0a6 6 0 0 1 6 6M18 3v6a6 6 0 0 1-3 5"/>'),
grid:svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'),
extract:svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6"/>'),
zip:svg('<path d="M4 14h16M12 4v7m-3-3 3 3 3-3M5 14l1 6h12l1-6"/>'),home:svg('<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
gear:svg('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),info:svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
rot:svg('<path d="M20 12a8 8 0 1 1-3-6.2M20 4v5h-5"/>'),clock:svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
up:svg('<path d="m6 15 6-6 6 6"/>'),down:svg('<path d="m6 9 6 6 6-6"/>'),x:svg('<path d="M6 6l12 12M18 6 6 18"/>')};
export function toast(m,k=''){const e=$('#toast');e.textContent=m;e.className='show '+k;clearTimeout(toast.h);toast.h=setTimeout(()=>e.className='',3600)}
export function dropzone(el,input,onFiles){
  el.addEventListener('click',()=>input.click());
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}});
  el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('over')});
  el.addEventListener('dragleave',()=>el.classList.remove('over'));
  el.addEventListener('drop',e=>{e.preventDefault();el.classList.remove('over');onFiles([...e.dataTransfer.files])});
  input.addEventListener('change',()=>{onFiles([...input.files]);input.value=''});
}
// Reorderable list: mouse drag-and-drop plus keyboard-friendly up/down buttons.
export function sortableList(host,arr,{row,onRemove,onChange}){
  const draw=()=>{host.innerHTML=arr.map((it,i)=>`<div class="row" draggable="true" data-i="${i}"><span class="num">${i+1}</span>${row(it,i)}
  <button class="icon" data-act="up" title="${t('up')}" aria-label="${t('up')}" ${i?'':'disabled'}>${ICON.up}</button>
  <button class="icon" data-act="down" title="${t('down')}" aria-label="${t('down')}" ${i<arr.length-1?'':'disabled'}>${ICON.down}</button>
  <button class="icon" data-act="rm" title="${t('remove')}" aria-label="${t('remove')}">${ICON.x}</button></div>`).join('');};
  const move=(a,b)=>{if(a===b||b<0||b>=arr.length)return;arr.splice(b,0,arr.splice(a,1)[0]);draw();onChange()};
  let from=-1;
  host.onclick=e=>{const b=e.target.closest('[data-act]');if(!b)return;const i=+b.closest('.row').dataset.i;
    if(b.dataset.act==='up')move(i,i-1);else if(b.dataset.act==='down')move(i,i+1);
    else if(b.dataset.act==='rm'){onRemove?.(arr.splice(i,1)[0]);draw();onChange()}
    else if(b.dataset.act==='sel'){arr[i].sel=b.checked;onChange()}};
  host.ondragstart=e=>{const r=e.target.closest('.row');if(!r)return;from=+r.dataset.i;r.classList.add('drag');e.dataTransfer.effectAllowed='move'};
  host.ondragover=e=>{const r=e.target.closest('.row');if(!r||from<0)return;e.preventDefault();host.querySelectorAll('.over').forEach(x=>x.classList.remove('over'));r.classList.add('over')};
  host.ondrop=e=>{const r=e.target.closest('.row');if(r&&from>=0){e.preventDefault();move(from,+r.dataset.i)}from=-1};
  host.ondragend=()=>{from=-1;host.querySelectorAll('.drag,.over').forEach(x=>x.classList.remove('drag','over'))};
  draw();return draw;
}
export function showResult({blob,name,pages}){
  const dlg=$('#dlg'),url=URL.createObjectURL(blob);
  dlg.innerHTML=`<div class="dh"><b>${t('done')} · ${esc(name)}.pdf <span class="tag">${fmt(blob.size)} · ${t('pages',{n:pages})}</span></b>
  <button class="btn" id="rc">${t('close')}</button><button class="btn pri" id="rd">${t('download')}</button></div><iframe src="${url}" title="${t('preview')}"></iframe>`;
  $('#rd',dlg).onclick=()=>{const a=document.createElement('a');a.href=url;a.download=name+'.pdf';a.click()};
  $('#rc',dlg).onclick=()=>dlg.close();
  dlg.addEventListener('close',()=>URL.revokeObjectURL(url),{once:true});
  dlg.showModal();
}
export function progress(root){const w=$('.prog',root),b=$('i',w),p=$('.pt',root);
  return{show(on){w.hidden=p.hidden=!on;b.style.width='0'},set(a,n){b.style.width=(a/n*100)+'%';p.textContent=t('working',{a,b:n})}}}
