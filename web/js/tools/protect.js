import {t} from '../i18n.js';
import {$,toast,dropzone,safeName,showResult,ICON} from '../ui.js';
import {task,explain} from '../worker.js';

export const id='protect',titleKey='protectTitle',descKey='protectDesc',icon=ICON.info;

let source=null,pages=0,busy=false,inspect=null,job=null,generation=0,name='document',cancelCurrent=()=>{};

function protectWithQpdf(input,userPassword,ownerPassword,permissions){
  const worker=new Worker(new URL('../workers/qpdf-protect.worker.js',import.meta.url));
  let settled=false;
  let rejectPromise;
  const promise=new Promise((resolve,reject)=>{
    rejectPromise=reject;
    worker.onmessage=({data})=>{
      if(settled)return;
      settled=true;
      worker.terminate();
      if(data?.success)resolve(data.output);
      else reject(new Error(data?.error||'Protection failed.'));
    };
    worker.onerror=()=>{
      if(settled)return;
      settled=true;
      worker.terminate();
      reject(new Error('Protection worker failed.'));
    };
    try{
      worker.postMessage({input,userPassword,ownerPassword,permissions},[input]);
    }catch(error){
      settled=true;
      worker.terminate();
      reject(error);
    }
  });
  return {
    promise,
    cancel(){
      if(settled)return;
      settled=true;
      worker.terminate();
      rejectPromise('cancel');
    }
  };
}

export function mount(root){
  const token=++generation,current=()=>token===generation;

  root.innerHTML=`
    <div class="work">
      <div>
        <div class="dz" id="dz" tabindex="0" role="button">
          <strong>${t('dropOne')}</strong>${t('dropOneSub')}
        </div>
        <input id="fi" type="file" accept="application/pdf,.pdf" hidden>
        <div class="bar"><span id="info"></span></div>
        <div class="panel plain">
          <h3>${t('protectPermissions')}</h3>
          <label><input id="allowPrint" type="checkbox"> ${t('protectAllowPrint')}</label>
          <label><input id="allowCopy" type="checkbox"> ${t('protectAllowCopy')}</label>
          <label><input id="allowModify" type="checkbox"> ${t('protectAllowModify')}</label>
          <p class="muted">${t('protectPermissionNote')}</p>
        </div>
      </div>
      <div class="panel">
        <h2>${t('protectTitle')}</h2>
        <label>${t('userPassword')}
          <input id="userPass" type="password" autocomplete="new-password" minlength="8" maxlength="128">
        </label>
        <label>${t('confirmUserPassword')}
          <input id="userConfirm" type="password" autocomplete="new-password" minlength="8" maxlength="128">
        </label>
        <label>${t('ownerPassword')}
          <input id="ownerPass" type="password" autocomplete="new-password" minlength="8" maxlength="128">
        </label>
        <label>${t('confirmOwnerPassword')}
          <input id="ownerConfirm" type="password" autocomplete="new-password" minlength="8" maxlength="128">
        </label>
        <label>${t('fname')}
          <input id="name" value="document-protected" maxlength="120">
        </label>
        <p class="muted">${t('protectSecurityNote')}</p>
        <p class="muted">${t('protectLimit')}</p>
        <button class="btn" id="stop" hidden>${t('cancel')}</button>
        <button class="btn pri" id="go" disabled>${t('protectBtn')}</button>
      </div>
    </div>`;

  const update=()=>{
    if(!current())return;
    $('#go',root).disabled=busy||!source;
    $('#stop',root).hidden=!busy;
  };

  dropzone($('#dz',root),$('#fi',root),async files=>{
    const file=files.find(x=>x.type==='application/pdf'||x.name.toLowerCase().endsWith('.pdf'));
    if(!file)return toast(t('badPdf',{f:files[0]?.name||''}),'err');
    if(file.size>256*1024*1024)return toast(t('protectLimit'),'err');

    inspect?.cancel();
    cancelCurrent();
    source=null;
    update();

    const op=task('inspect',{file});
    inspect=op;
    try{
      const count=await op.promise;
      if(!current()||inspect!==op)return;
      pages=count;
      source=file;
      name=safeName(file.name)+'-protected';
      $('#name',root).value=name;
      $('#info',root).textContent=`${file.name} · ${t('pages',{n:pages})}`;
      update();
    }catch(error){
      if(current()&&error!=='cancel')toast(explain(error),'err');
    }finally{
      if(inspect===op)inspect=null;
    }
  });

  $('#name',root).oninput=e=>name=e.target.value;
  $('#stop',root).onclick=()=>cancelCurrent();

  $('#go',root).onclick=async()=>{
    if(!current()||busy||!source)return;

    const userPassword=$('#userPass',root).value;
    const userConfirm=$('#userConfirm',root).value;
    const ownerPassword=$('#ownerPass',root).value;
    const ownerConfirm=$('#ownerConfirm',root).value;

    if(userPassword.length<8||ownerPassword.length<8)
      return toast(t('protectPasswordShort'),'err');
    if(userPassword!==userConfirm||ownerPassword!==ownerConfirm)
      return toast(t('protectPasswordMismatch'),'err');
    if(userPassword===ownerPassword)
      return toast(t('protectPasswordSame'),'err');

    const file=source;
    const outputName=safeName(name);
    const permissions={
      print:$('#allowPrint',root).checked,
      copy:$('#allowCopy',root).checked,
      modify:$('#allowModify',root).checked
    };

    let cancelled=false,work=null;
    cancelCurrent=()=>{
      cancelled=true;
      work?.cancel();
    };

    busy=true;
    update();

    try{
      const input=await file.arrayBuffer();
      if(!current())return;
      if(cancelled){toast(t('cancelled'));return;}

      work=protectWithQpdf(input,userPassword,ownerPassword,permissions);
      job=work;
      const output=await work.promise;

      if(current()&&source===file){
        showResult({
          blob:new Blob([output],{type:'application/pdf'}),
          name:outputName,
          pages,
          operation:'op_protect'
        });
      }
    }catch(error){
      if(current()){
        if(error==='cancel')toast(t('cancelled'));
        else toast(t('protectFail'),'err');
      }
    }finally{
      if(current()){
        $('#userPass',root).value='';
        $('#userConfirm',root).value='';
        $('#ownerPass',root).value='';
        $('#ownerConfirm',root).value='';
        if(job===work)job=null;
        cancelCurrent=()=>{};
        busy=false;
        update();
      }
    }
  };

  update();
}

export function unmount({preserveState=false}={}){
  generation++;
  cancelCurrent();
  cancelCurrent=()=>{};
  inspect?.cancel();
  inspect=null;
  job?.cancel();
  job=null;
  busy=false;
  if(!preserveState){
    source=null;
    pages=0;
    name='document';
  }
}
