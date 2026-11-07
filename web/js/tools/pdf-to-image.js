import {t} from '../i18n.js';
import {$,toast,dropzone,safeName,showFileResult,progress,ICON} from '../ui.js';
import {task,explain} from '../worker.js';
import {parseRanges} from './extract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';

function imageTool({id,titleKey,descKey,format,mime,extension}){
  let file=null,pages=0,busy=false,active=null,inspectTask=null,generation=0;
  let rangeValue='',scaleValue='1.5',outputName='converted';

  function cancelActive(){
    if(!active)return;
    active.cancelled=true;
    try{active.renderTask?.cancel()}catch{}
    active.zipTask?.cancel();
    void active.pdfDoc?.destroy?.().catch?.(()=>{});
    void active.loadingTask?.destroy?.().catch?.(()=>{});
  }

  return{
    id,titleKey,descKey,icon:ICON.image,
    mount(root){
      const token=++generation,isCurrent=()=>token===generation;
      root.innerHTML=`<div class="work"><div><div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden><div class="bar"><span id="info"></span></div><div class="empty" id="emptyState">${t('pdfImageEmpty')}</div></div><div class="panel"><h2>${t(titleKey)}</h2><label>${t('imagePageRange')}<input id="range" placeholder="${t('rangeHint')}" value="${rangeValue}"></label><label>${t('imageScale')}<select id="scale"><option value="1">100%</option><option value="1.5">150%</option><option value="2">200%</option></select></label><label>${t('fname')}<input id="name" value="${outputName}"></label><div class="prog" hidden><i></i></div><div class="pt" hidden></div><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go" disabled>${t('convertImages')}</button></div></div>`;
      const prog=progress(root);
      $('#scale',root).value=scaleValue;
      const update=()=>{if(isCurrent()){$('#go',root).disabled=busy||!file;$('#stop',root).hidden=!busy}};
      $('#range',root).oninput=event=>rangeValue=event.target.value;
      $('#scale',root).onchange=event=>scaleValue=event.target.value;
      $('#name',root).oninput=event=>outputName=event.target.value;

      dropzone($('#dz',root),$('#fi',root),async files=>{
        if(!isCurrent())return;
        const selected=files.find(item=>item.type==='application/pdf'||item.name.toLowerCase().endsWith('.pdf'));
        if(!selected)return toast(t('badPdf',{f:files[0]?.name||''}),'err');
        inspectTask?.cancel();cancelActive();active=null;busy=false;prog.show(false);
        const inspection=task('inspect',{file:selected});inspectTask=inspection;
        try{
          const count=await inspection.promise;
          if(!isCurrent()||inspectTask!==inspection)return;
          file=selected;pages=count;outputName=safeName(selected.name);
          $('#info',root).textContent=`${selected.name} · ${t('pages',{n:count})}`;
          $('#emptyState',root).hidden=true;$('#name',root).value=outputName;update();
        }catch(error){if(isCurrent()&&inspectTask===inspection&&error!=='cancel'){file=null;toast(explain(error),'err');update()}}
        finally{if(inspectTask===inspection)inspectTask=null}
      });

      $('#stop',root).onclick=()=>cancelActive();
      $('#go',root).onclick=async()=>{
        if(!isCurrent()||!file||busy)return;
        const state={cancelled:false,loadingTask:null,pdfDoc:null,renderTask:null,zipTask:null};
        const selectedFile=file,selectedPages=pages,selectedScale=Number($('#scale',root).value),selectedName=safeName($('#name',root).value||outputName);
        busy=true;active=state;update();prog.show(true);
        try{
          let indices=Array.from({length:selectedPages},(_,index)=>index);
          const range=$('#range',root).value.trim();
          if(range)indices=parseRanges(range,selectedPages);
          if(!indices.length)throw new Error(t('noSel'));
          if(indices.length>50)throw new Error(t('imagePageLimit'));
          if(state.cancelled||!isCurrent())throw 'cancel';
          const fileBytes=new Uint8Array(await selectedFile.arrayBuffer());
          if(state.cancelled||!isCurrent())throw 'cancel';
          state.loadingTask=pdfjsLib.getDocument({data:fileBytes});
          state.pdfDoc=await state.loadingTask.promise;
          state.loadingTask=null;
          if(state.cancelled||!isCurrent())throw 'cancel';
          const entries=[];
          for(let index=0;index<indices.length;index++){
            if(state.cancelled||!isCurrent())throw 'cancel';
            let page=null,canvas=null;
            try{
              page=await state.pdfDoc.getPage(indices[index]+1);
              if(state.cancelled||!isCurrent())throw 'cancel';
              const viewport=page.getViewport({scale:selectedScale});
              canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
              state.renderTask=page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport});
              await state.renderTask.promise;state.renderTask=null;
              if(state.cancelled||!isCurrent())throw 'cancel';
              const blob=await new Promise((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(new Error('Image encoding failed')),mime,format==='jpg'?.9:undefined));
              if(state.cancelled||!isCurrent())throw 'cancel';
              entries.push({name:`${selectedName}-page-${String(indices[index]+1).padStart(3,'0')}.${extension}`,blob});
              prog.set(index+1,indices.length);
            }finally{
              try{state.renderTask?.cancel()}catch{}
              state.renderTask=null;
              try{page?.cleanup?.()}catch{}
              if(canvas){canvas.width=0;canvas.height=0}
            }
          }
          await state.pdfDoc.destroy();state.pdfDoc=null;
          if(state.cancelled||!isCurrent())throw 'cancel';
          state.zipTask=task('zip',{entries});
          const zipped=await state.zipTask.promise;
          if(state.cancelled||!isCurrent())throw 'cancel';
          showFileResult({blob:zipped.blob,name:`${selectedName}-${format}.zip`,label:t(titleKey),operation:format==='jpg'?'op_pdfjpg':'op_pdfpng',pages:entries.length});
        }catch(error){
          if(isCurrent())(error==='cancel'||state.cancelled)?toast(t('cancelled')):toast(error.message||explain(error),'err');
        }finally{
          try{await state.pdfDoc?.destroy?.()}catch{}
          try{await state.loadingTask?.destroy?.()}catch{}
          state.pdfDoc=null;state.loadingTask=null;state.renderTask=null;state.zipTask=null;
          if(isCurrent()&&active===state){active=null;busy=false;prog.show(false);update()}
        }
      };
      update();
    },
    unmount({preserveState=false}={}){
      generation++;
      inspectTask?.cancel();inspectTask=null;
      cancelActive();active=null;busy=false;
      if(!preserveState){file=null;pages=0;rangeValue='';scaleValue='1.5';outputName='converted'}
    }
  };
}

export const pdfToJpg=imageTool({id:'pdf-to-jpg',titleKey:'pdfJpgTitle',descKey:'pdfJpgDesc',format:'jpg',mime:'image/jpeg',extension:'jpg'});
export const pdfToPng=imageTool({id:'pdf-to-png',titleKey:'pdfPngTitle',descKey:'pdfPngDesc',format:'png',mime:'image/png',extension:'png'});
