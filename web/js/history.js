// Lightweight local history in IndexedDB: metadata only, never file contents.
const open=()=>new Promise((res,rej)=>{const r=indexedDB.open('abpdf',1);r.onupgradeneeded=()=>r.result.createObjectStore('history',{keyPath:'id',autoIncrement:true});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const run=async(mode,fn)=>{const db=await open();return new Promise((res,rej)=>{const tx=db.transaction('history',mode),s=tx.objectStore('history'),q=fn(s);tx.oncomplete=()=>res(q&&q.result);tx.onerror=()=>rej(tx.error)})};
export const addHistory=(op,name,size,pages)=>run('readwrite',s=>s.add({op,name,size,pages,date:Date.now()})).catch(()=>{});
export const listHistory=()=>run('readonly',s=>s.getAll()).then(r=>(r||[]).reverse()).catch(()=>[]);
export const removeHistory=id=>run('readwrite',s=>s.delete(id));
export const clearHistory=()=>run('readwrite',s=>s.clear());
