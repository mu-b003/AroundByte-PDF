import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {task,explain} from '../worker.js';
export const id='sign',titleKey='signTitle',descKey='signDesc',icon=ICON.info;
let source=null,pages=0,busy=false,inspect=null,job=null,generation=0,name='document';
export function mount(root){
 const token=++generation,current=()=>token===generation;
 root.innerHTML=`<div class="work"><div><div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input id="fi" type="file" accept="application/pdf,.pdf" hidden><div class="bar"><span id="info"></span></div><div class="sign-pad"><div class="bar"><b>${t('drawSignature')}</b><span class="sp"></span><button class="btn ghost" id="clear">${t('clearSignature')}</button></div><canvas id="sig" width="1000" height="260" aria-label="${t('drawSignature')}"></canvas></div></div><div class="panel"><h2>${t('signTitle')}</h2><label>${t('signPage')}<input id="page" type="number" min="1" value="1"></label><label>${t('fname')}<input id="name" value="document-signed"></label><p class="muted">${t('signHint')}</p><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go" disabled>${t('signApply')}</button></div></div>`;
 const canvas=$('#sig',root),ctx=canvas.getContext('2d');ctx.lineWidth=7;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#171717';let drawing=false,hasInk=false;
 const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;canvas.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.1,p.y+.1);ctx.stroke();hasInk=true;update()});
 canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke()});
 const stopDraw=()=>drawing=false;canvas.addEventListener('pointerup',stopDraw);canvas.addEventListener('pointercancel',stopDraw);
 $('#clear',root).onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasInk=false;update()};
 const update=()=>{if(current()){$('#go',root).disabled=busy||!source||!hasInk;$('#stop',root).hidden=!busy}};
 dropzone($('#dz',root),$('#fi',root),async files=>{const file=files.find(x=>x.type==='application/pdf'||x.name.toLowerCase().endsWith('.pdf'));if(!file)return toast(t('badPdf',{f:files[0]?.name||''}),'err');inspect?.cancel();job?.cancel();source=null;const op=task('inspect',{file});inspect=op;try{pages=await op.promise;if(!current()||inspect!==op)return;source=file;name=safeName(file.name)+'-signed';$('#name',root).value=name;$('#page',root).max=pages;$('#info',root).textContent=`${file.name} · ${t('pages',{n:pages})}`;update()}catch(e){if(current()&&e!=='cancel')toast(explain(e),'err')}finally{if(inspect===op)inspect=null}});
 $('#name',root).oninput=e=>name=e.target.value;$('#stop',root).onclick=()=>job?.cancel();
 $('#go',root).onclick=async()=>{if(!current()||busy||!source||!hasInk)return;const page=Number($('#page',root).value);if(!Number.isInteger(page)||page<1||page>pages)return toast(t('badPage'),'err');busy=true;update();const file=source;const signatureBlob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!signatureBlob){busy=false;update();return toast(t('badSignature'),'err')}const work=task('sign',{file,png:new Uint8Array(await signatureBlob.arrayBuffer()),page});job=work;
  try{const result=await work.promise;if(current()&&source===file)showResult({blob:new Blob([result.bytes],{type:'application/pdf'}),name:safeName(name),pages:result.pages,operation:'op_sign'})}catch(e){if(current())e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}finally{if(current()&&job===work){job=null;busy=false;update()}}};update();
}
export function unmount(){generation++;inspect?.cancel();inspect=null;job?.cancel();job=null;source=null;busy=false}
