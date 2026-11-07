import {t,addStrings} from '../i18n.js';
import {compressWithGhostscript} from '../gs-compress.js';
import {$,esc,toast,dropzone,safeName,showResult,ICON,fmt} from '../ui.js';
import {task,explain} from '../worker.js';
addStrings({
  compressDesc:'Shrink PDF size with the built-in Ghostscript engine. Runs in your browser.',
  compressNote:'Images are re-sampled to reduce size. If the result is not smaller, your original is kept.',
  gsExtreme:'Extreme',gsExtremeSub:'Smallest file, lower image quality',gsBalanced:'Balanced',gsBalancedSub:'Recommended',gsHigh:'High quality',gsHighSub:'Best quality, smaller savings',
  gsPreset:'Compression level',
  gs_loading:'Loading compression engine…',gs_initializing:'Starting engine…',gs_writing_input:'Reading your PDF…',gs_processing:'Compressing…',gs_reading_output:'Preparing result…',gs_complete:'Verifying…',
  gsSaved:'Reduced from {a} to {b} ({p}% smaller).',gsNoGain:'Could not make this PDF smaller. The original file is kept.',
  gsFail:'Compression failed. Try a different level or file.',gsLoadFail:'The compression engine could not be loaded. Check your connection and try again.',gsTooBig:'This file is too large to compress in the browser (limit 256 MB).'
},{
  compressDesc:'قلّل حجم ملف PDF باستخدام محرك Ghostscript المدمج. يعمل داخل متصفحك.',
  compressNote:'تتم إعادة معالجة الصور لتقليل الحجم. إذا لم يصبح الناتج أصغر فسيتم الاحتفاظ بالملف الأصلي.',
  gsExtreme:'أقصى ضغط',gsExtremeSub:'أصغر حجم، جودة صور أقل',gsBalanced:'متوازن',gsBalancedSub:'موصى به',gsHigh:'جودة عالية',gsHighSub:'أفضل جودة، توفير أقل',
  gsPreset:'مستوى الضغط',
  gs_loading:'جارٍ تحميل محرك الضغط…',gs_initializing:'جارٍ تشغيل المحرك…',gs_writing_input:'جارٍ قراءة الملف…',gs_processing:'جارٍ الضغط…',gs_reading_output:'جارٍ تجهيز النتيجة…',gs_complete:'جارٍ التحقق…',
  gsSaved:'تم التقليل من {a} إلى {b} (أصغر بنسبة {p}%).',gsNoGain:'تعذّر تصغير هذا الملف. سيتم الاحتفاظ بالأصل.',
  gsFail:'فشل الضغط. جرّب مستوى أو ملفًا آخر.',gsLoadFail:'تعذّر تحميل محرك الضغط. تحقق من الاتصال وحاول مرة أخرى.',gsTooBig:'الملف كبير جدًا للضغط داخل المتصفح (الحد 256 م.ب).'
});
export const id='compress',titleKey='compressTitle',descKey='compressDesc',icon=ICON.zip;
let source=null,pages=0,busy=false,job=null,inspection=null,name='document',generation=0,preset='balanced';
export function mount(root){
  const token=++generation,current=()=>token===generation;
  root.innerHTML=`<div class="work"><div><div class="dz" id="dz" tabindex="0" role="button"><strong>${t('dropOne')}</strong>${t('dropOneSub')}</div><input id="fi" type="file" accept="application/pdf,.pdf" hidden><div class="bar"><span id="info"></span></div><div class="empty" id="empty">${t('advancedEmpty')}</div></div><div class="panel"><h2>${t('compressTitle')}</h2><p class="muted">${t('compressNote')}</p><fieldset class="gsp" style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:8px"><legend class="muted" style="padding:0;margin-bottom:6px;font-size:12px">${t('gsPreset')}</legend>${[['extreme','gsExtreme'],['balanced','gsBalanced'],['highQuality','gsHigh']].map(([v,k])=>`<label class="check-row"><input type="radio" name="gspreset" value="${v}"${v===preset?' checked':''}><span><b>${t(k)}</b> · ${t(k+'Sub')}</span></label>`).join('')}</fieldset><label>${t('fname')}<input id="name" value="document"></label><button class="btn" id="stop" hidden>${t('cancel')}</button><button class="btn pri" id="go" disabled>${t('compressBtn')}</button></div></div>`;
  const update=()=>{if(current()){$('#go',root).disabled=busy||!source;$('#stop',root).hidden=!busy}};
  dropzone($('#dz',root),$('#fi',root),async files=>{
    const file=files.find(x=>x.type==='application/pdf'||x.name.toLowerCase().endsWith('.pdf'));if(!file)return toast(t('badPdf',{f:files[0]?.name||''}),'err');
    inspection?.cancel();job?.cancel();source=null;busy=false;update();const check=task('inspect',{file});inspection=check;
    try{pages=await check.promise;if(!current()||inspection!==check)return;source=file;name=safeName(file.name)+'-compressed';$('#name',root).value=name;$('#info',root).textContent=`${file.name} · ${t('pages',{n:pages})}`;$('#empty',root).hidden=true;update()}
    catch(e){if(current()&&e!=='cancel')toast(explain(e),'err')}finally{if(inspection===check)inspection=null}
  });
  $('#name',root).oninput=e=>name=e.target.value;
  $('#stop',root).onclick=()=>job?.cancel();
  root.querySelectorAll('input[name=gspreset]').forEach(r=>r.onchange=e=>preset=e.target.value);
  const stage=k=>{if(current())$('#info',root).textContent=t('gs_'+String(k).replace(/-/g,'_'))};
  $('#go',root).onclick=async()=>{if(!current()||busy||!source)return;busy=true;update();const currentFile=source,currentPages=pages,level=preset;
    let work;
    try{
      const buffer=await currentFile.arrayBuffer();
      if(!current()||source!==currentFile)return;
      const original=buffer.byteLength;
      work=compressWithGhostscript(buffer,level,stage);job=work;
      const out=await work.promise;
      if(!current()||source!==currentFile)return;
      let bytes=out.bytes,usedGs=out.compressedSize<original;
      if(usedGs){ // verify the engine output is a readable PDF with the same page count
        try{const check=task('inspect',{file:new Blob([bytes],{type:'application/pdf'})});job=check;const n=await check.promise;if(n!==currentPages)usedGs=false}catch(e){if(e==='cancel')throw e;usedGs=false}
      }
      if(!usedGs){toast(t('gsNoGain'));bytes=new Uint8Array(await currentFile.arrayBuffer())}
      else toast(t('gsSaved',{a:fmt(original),b:fmt(bytes.length),p:Math.max(0,Math.round((1-bytes.length/original)*100))}));
      $('#info',root).textContent=`${currentFile.name} · ${t('pages',{n:currentPages})}`;
      showResult({blob:new Blob([bytes],{type:'application/pdf'}),name:safeName(name),pages:currentPages,operation:'op_compress'});
    }catch(e){
      if(!current())return;
      if(e==='cancel')toast(t('cancelled'));
      else toast(e?.code==='FILE_TOO_LARGE'?t('gsTooBig'):(e?.code==='WORKER_CRASH'||e?.code==='WORKER_START')?t('gsLoadFail'):e?.code==='INVALID_PDF'?t('badPdf',{f:currentFile.name}):t('gsFail'),'err');
      console.warn('Compress failed',e?.code,e?.message||e);
    }
    finally{if(current()){job=null;busy=false;$('#info',root).textContent=`${currentFile.name} · ${t('pages',{n:currentPages})}`;update()}}
  };update();
}
export function unmount(){generation++;inspection?.cancel();inspection=null;job?.cancel();job=null;source=null;busy=false}
