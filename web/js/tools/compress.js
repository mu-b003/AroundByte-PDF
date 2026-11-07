import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {task,explain} from '../worker.js';
export const id='compress',titleKey='compressTitle',descKey='compressDesc',icon=ICON.zip;
let source=null,pages=0,busy=false,job=null,inspection=null,name='document',generation=0;
export function mount(root){
  const token=++generation,current=()=>token===generation;
  root.innerHTML=`<div class="work"><div><div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input id="fi" type="file" accept="application/pdf,.pdf" hidden><div class="bar"><span id="info"></span></div><div class="empty" id="empty">${t('advancedEmpty')}</div></div><div class="panel"><h2>${t('compressTitle')}</h2><p class="muted">${t('compressNote')}</p><label>${t('fname')}<input id="name" value="document"></label><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go" disabled>${t('compressBtn')}</button></div></div>`;
  const update=()=>{if(current()){$('#go',root).disabled=busy||!source;$('#stop',root).hidden=!busy}};
  dropzone($('#dz',root),$('#fi',root),async files=>{
    const file=files.find(x=>x.type==='application/pdf'||x.name.toLowerCase().endsWith('.pdf'));if(!file)return toast(t('badPdf',{f:files[0]?.name||''}),'err');
    inspection?.cancel();job?.cancel();source=null;busy=false;update();const check=task('inspect',{file});inspection=check;
    try{pages=await check.promise;if(!current()||inspection!==check)return;source=file;name=safeName(file.name)+'-compressed';$('#name',root).value=name;$('#info',root).textContent=`${file.name} · ${t('pages',{n:pages})}`;$('#empty',root).hidden=true;update()}
    catch(e){if(current()&&e!=='cancel')toast(explain(e),'err')}finally{if(inspection===check)inspection=null}
  });
  $('#name',root).oninput=e=>name=e.target.value;
  $('#stop',root).onclick=()=>job?.cancel();
  $('#go',root).onclick=async()=>{if(!current()||busy||!source)return;busy=true;update();const currentFile=source;const work=task('compress',{file:currentFile});job=work;
    try{const result=await work.promise;if(!current()||source!==currentFile)return;if(!result.compressed)toast(t('alreadyOptimized'));showResult({blob:new Blob([result.bytes],{type:'application/pdf'}),name:safeName(name),pages:result.pages,operation:'op_compress'})}
    catch(e){if(current())e==='cancel'?toast(t('cancelled')):toast(explain(e),'err')}
    finally{if(current()&&job===work){job=null;busy=false;update()}}
  };update();
}
export function unmount(){generation++;inspection?.cancel();inspection=null;job?.cancel();job=null;source=null;busy=false}
