import {t} from './i18n.js';
// Run one job in a fresh worker. cancel() terminates it immediately and rejects with 'cancel'.
export function task(op,payload,{onProgress,onItem}={}){
  const w=new Worker('js/workers/task.worker.js');let rej;
  const promise=new Promise((res,r)=>{rej=r;
    w.onmessage=({data:m})=>{
      if(m.type==='progress')onProgress?.(m.a,m.b);else if(m.type==='item')onItem?.(m);
      else if(m.type==='done'){w.terminate();res(m.result)}
      else{w.terminate();r(m)}};
    w.onerror=e=>{w.terminate();r({code:'fail',message:e.message})};
    w.postMessage({op,payload})});
  return{promise,cancel(){w.terminate();rej('cancel')}};
}
export const explain=e=>{const f=e.name||'';
  return({empty:()=>t('emptyF',{f}),bad:()=>t('badPdf',{f}),enc:()=>t('encPdf',{f}),type:()=>t('failed'),verify:()=>t('verifyFail')})[e.code]?.()||t('failed')+': '+(e.message||e)};
