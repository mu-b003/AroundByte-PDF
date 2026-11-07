import {t} from '../i18n.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {task,explain} from '../worker.js';

const aborted=signal=>signal?.aborted;

async function makeWatermarkPng(text,size,opacity,signal){
  if(!text||!text.trim()||[...text].length>200)throw{code:'badtext'};
  if(aborted(signal))throw new DOMException('The operation was aborted','AbortError');
  size=Math.min(120,Math.max(12,Number(size)||42));
  opacity=Math.min(.45,Math.max(.08,Number(opacity)||.22));
  await document.fonts.load(`700 ${size*3}px "Noto Sans Arabic"`);
  await document.fonts.ready;
  if(aborted(signal))throw new DOMException('The operation was aborted','AbortError');
  const scale=3,pixels=size*scale,measure=document.createElement('canvas').getContext('2d');
  measure.font=`700 ${pixels}px "Noto Sans Arabic", Inter, sans-serif`;
  const metrics=measure.measureText(text),padding=pixels*.35,width=Math.ceil(metrics.width+padding*2),height=Math.ceil(pixels*1.8+padding*2),angle=-35*Math.PI/180;
  const rotatedWidth=Math.ceil(width*Math.abs(Math.cos(angle))+height*Math.abs(Math.sin(angle)));
  const rotatedHeight=Math.ceil(width*Math.abs(Math.sin(angle))+height*Math.abs(Math.cos(angle)));
  const canvas=document.createElement('canvas');
  try{
    canvas.width=Math.max(1,rotatedWidth);canvas.height=Math.max(1,rotatedHeight);
    const context=canvas.getContext('2d');
    context.translate(canvas.width/2,canvas.height/2);context.rotate(angle);
    context.font=`700 ${pixels}px "Noto Sans Arabic", Inter, sans-serif`;
    context.textAlign='center';context.textBaseline='middle';
    context.direction=/[\u0600-\u06FF]/.test(text)?'rtl':'ltr';
    context.globalAlpha=opacity;context.fillStyle='#8c8c8c';context.fillText(text,0,0);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw{code:'badtext'};
    if(aborted(signal))throw new DOMException('The operation was aborted','AbortError');
    return new Uint8Array(await blob.arrayBuffer());
  }finally{canvas.width=canvas.height=0}
}

function singlePdfTool({id,titleKey,descKey,icon,fields,operation,outputSuffix}){
  const defaults=Object.fromEntries(fields.map(field=>[field.id,field.value??'']));
  let source=null,base='document',outputName='document',busy=false,currentTask=null,inspectTask=null,preparationController=null,generation=0,formValues={...defaults};
  return{
    id,titleKey,descKey,icon,
    mount(root){
      const token=++generation,isCurrent=()=>token===generation;
      const controls=fields.map(field=>`<label>${t(field.label)}${field.type==='textarea'?`<textarea id="${field.id}" rows="${field.rows||3}" placeholder="${esc(t(field.placeholder||''))}">${esc(formValues[field.id]??'')}</textarea>`:`<input id="${field.id}" type="${field.type||'text'}" ${field.min!==undefined?`min="${field.min}"`:''} ${field.max!==undefined?`max="${field.max}"`:''} ${field.step?`step="${field.step}"`:''} ${field.maxLength?`maxlength="${field.maxLength}"`:''} value="${esc(formValues[field.id]??'')}" placeholder="${esc(t(field.placeholder||''))}">`}</label>`).join('');
      root.innerHTML=`<div class="work"><div><div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input type="file" id="fi" accept="application/pdf,.pdf" hidden><div class="bar"><span id="fileInfo"></span></div><div class="empty" id="emptyState">${t('advancedEmpty')}</div></div><div class="panel"><h2>${t(titleKey)}</h2>${controls}<label>${t('fname')}<input id="name" value="${esc(outputName)}"></label><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go" disabled>${t('runTool')}</button></div></div>`;
      const update=()=>{if(isCurrent()){$('#go',root).disabled=busy||!source;$('#stop',root).hidden=!busy}};
      dropzone($('#dz',root),$('#fi',root),async files=>{
        if(!isCurrent())return;
        const file=files.find(item=>item.type==='application/pdf'||item.name.toLowerCase().endsWith('.pdf'));
        if(!file)return toast(t('badPdf',{f:files[0]?.name||''}),'err');
        inspectTask?.cancel();
        preparationController?.abort();preparationController=null;
        currentTask?.cancel();currentTask=null;busy=false;update();
        const inspection=task('inspect',{file});inspectTask=inspection;
        try{
          const pages=await inspection.promise;
          if(!isCurrent()||inspectTask!==inspection)return;
          source=file;base=safeName(file.name);outputName=base+outputSuffix;$('#fileInfo',root).textContent=`${file.name} · ${t('pages',{n:pages})}`;
          $('#emptyState',root).hidden=true;$('#name',root).value=outputName;update();
        }catch(error){if(isCurrent()&&inspectTask===inspection&&error!=='cancel'){source=null;toast(explain(error),'err');update()}}
        finally{if(inspectTask===inspection)inspectTask=null}
      });
      $('#name',root).oninput=event=>outputName=event.target.value;
      for(const field of fields){$('#'+field.id,root).oninput=event=>formValues[field.id]=event.target.value}
      $('#stop',root).onclick=()=>{preparationController?.abort();currentTask?.cancel()};
      $('#go',root).onclick=async()=>{
        if(!isCurrent()||!source||busy)return;
        busy=true;update();
        const controller=new AbortController();preparationController=controller;
        let job=null;
        try{
          const values={};
          for(const field of fields){const element=$(`#${field.id}`,root);values[field.id]=field.type==='number'?Number(element.value):element.value}
          const payload={file:source,...(operation==='metadata'?{fields:values}:values)};
          if(operation==='watermark')payload.png=await makeWatermarkPng(values.text,values.size,values.opacity,controller.signal);
          if(!isCurrent())return;
          job=task(operation,payload);currentTask=job;
          const result=await job.promise;
          if(isCurrent())showResult({blob:new Blob([result.bytes],{type:'application/pdf'}),name:safeName(outputName||base),pages:result.pages,operation:'op_'+operation});
        }catch(error){if(isCurrent()&&error?.name!=='AbortError')error==='cancel'?toast(t('cancelled')):toast(explain(error),'err')}
        finally{
          if(preparationController===controller){
            preparationController=null;
            if(!job||currentTask===job){currentTask=null;busy=false;update()}
          }
        }
      };
      update();
    },
    unmount({preserveState=false}={}){
      generation++;
      inspectTask?.cancel();inspectTask=null;
      preparationController?.abort();preparationController=null;
      currentTask?.cancel();currentTask=null;busy=false;
      if(!preserveState){source=null;base='document';outputName='document';formValues={...defaults}}
    }
  };
}

export const rotate=singlePdfTool({id:'rotate',titleKey:'rotateTitle',descKey:'rotateDesc',icon:ICON.rot,outputSuffix:'-rotated',operation:'rotate',fields:[{id:'angle',label:'angleLbl',type:'number',value:90,min:90,max:270,step:90}]});
export const watermark=singlePdfTool({id:'watermark',titleKey:'watermarkTitle',descKey:'watermarkDesc',icon:ICON.info,outputSuffix:'-watermarked',operation:'watermark',fields:[{id:'text',label:'watermarkText',placeholder:'watermarkHint',maxLength:200},{id:'size',label:'watermarkSize',type:'number',value:42,min:12,max:120},{id:'opacity',label:'watermarkOpacity',type:'number',value:.22,min:.08,max:.45,step:.02}]});
export const numbers=singlePdfTool({id:'numbers',titleKey:'numbersTitle',descKey:'numbersDesc',icon:ICON.grid,outputSuffix:'-numbered',operation:'numbers',fields:[{id:'start',label:'numberStart',type:'number',value:1,min:1,max:9999},{id:'size',label:'numberSize',type:'number',value:11,min:8,max:24},{id:'format',label:'numberFormat',type:'text',value:'plain',placeholder:'numberFormatHint'}]});
export const metadata=singlePdfTool({id:'metadata',titleKey:'metadataTitle',descKey:'metadataDesc',icon:ICON.info,outputSuffix:'-metadata',operation:'metadata',fields:[{id:'title',label:'metaTitle'},{id:'author',label:'metaAuthor'},{id:'subject',label:'metaSubject'},{id:'keywords',label:'metaKeywords'},{id:'creator',label:'metaCreator'}]});
