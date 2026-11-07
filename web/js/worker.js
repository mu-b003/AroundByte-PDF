import {t} from './i18n.js';

// Run one job in a fresh worker.
// Cancellation terminates the worker immediately and rejects with 'cancel'.
export function task(op,payload,{onProgress,onItem}={}){
  let w;
  try{w=new Worker('js/workers/task.worker.js')}
  catch(error){
    return{
      promise:Promise.reject({code:'fail',message:error?.message||String(error)}),
      cancel(){}
    };
  }
  let settled=false;
  let rejectPromise;

  const cleanup=()=>{
    w.onmessage=null;
    w.onerror=null;
    w.onmessageerror=null;
    w.terminate();
  };

  const finish=(fn,value)=>{
    if(settled)return;
    settled=true;
    cleanup();
    fn(value);
  };

  const promise=new Promise((resolve,reject)=>{
    rejectPromise=reject;

    w.onmessage=({data:m})=>{
      if(settled)return;

      try{
        if(m.type==='progress')onProgress?.(m.a,m.b);
        else if(m.type==='item')onItem?.(m);
        else if(m.type==='done')finish(resolve,m.result);
        else finish(reject,m);
      }catch(e){
        finish(reject,{code:'fail',message:e?.message||String(e)});
      }
    };

    w.onerror=e=>{
      finish(reject,{code:'fail',message:e.message||'Worker error'});
    };

    w.onmessageerror=()=>{
      finish(reject,{code:'fail',message:'Invalid worker message'});
    };

    try{
      w.postMessage({op,payload});
    }catch(e){
      finish(reject,{code:'fail',message:e?.message||String(e)});
    }
  });

  return{
    promise,
    cancel(){
      if(settled)return;
      settled=true;
      cleanup();
      rejectPromise('cancel');
    }
  };
}

export const explain=e=>{
  const f=e?.name||'';
  return({
    empty:()=>t('emptyF',{f}),
    bad:()=>t('badPdf',{f}),
    enc:()=>t('encPdf',{f}),
    type:()=>t('failed'),
    verify:()=>t('verifyFail'),
    badtext:()=>t('watermarkLatin'),
    badangle:()=>t('badAngle'),
    badsign:()=>t('badSignature'),
    noforms:()=>t('noFormFields'),
    formfield:()=>t('formFieldFailed')
  })[e?.code]?.()||t('failed')+': '+(e?.message||e||'Unknown error');
};
