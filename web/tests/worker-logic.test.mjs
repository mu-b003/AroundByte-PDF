// Node harness: runs js/workers/task.worker.js in a simulated worker scope and exercises the non-canvas ops.
// Usage: node tests/worker-logic.test.mjs
import fs from 'fs';import vm from 'vm';import path from 'path';import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const msgs=[];let waiter;
// Single realm: the worker script is evaluated in this global scope with a fake worker environment.
globalThis.self=globalThis;globalThis.window=globalThis;
globalThis.postMessage=m=>{msgs.push(m);if(m.type==='done'||m.type==='error')waiter?.()};
globalThis.importScripts=n=>vm.runInThisContext(fs.readFileSync(path.join(root,'vendor',path.basename(n)),'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(root,'js/workers/task.worker.js'),'utf8'));
const run=async(op,payload)=>{msgs.length=0;await new Promise(r=>{waiter=r;globalThis.onmessage({data:{op,payload}})});return msgs.at(-1)};
const mkfile=(name,u8)=>({name,size:u8.length,slice:(a,b)=>({arrayBuffer:async()=>u8.slice(a,b).buffer}),arrayBuffer:async()=>u8.buffer.slice(u8.byteOffset,u8.byteOffset+u8.length)});
importScripts('pdf-lib.min.js');const {PDFDocument,degrees}=PDFLib;
const pdf=async(widths)=>{const d=await PDFDocument.create();widths.forEach(w=>d.addPage([w,50]));return d.save()};
let ok=0,bad=0;const ck=(n,c)=>{c?ok++:(bad++,console.log('FAIL',n))};
const A=mkfile('a.pdf',await pdf([100,200])),B=mkfile('b.pdf',await pdf([300]));
ck('inspect',(await run('inspect',{file:A})).result===2);
let m=await run('merge',{files:[B,A]});ck('merge done',m.type==='done'&&m.result.pages===3);
let out=await PDFDocument.load(m.result.bytes);ck('merge order',[300,100,200].every((w,i)=>out.getPage(i).getSize().width===w));
ck('merge progress',msgs.some(x=>x.type==='progress'&&x.a===2&&x.b===2));
m=await run('export',{file:A,list:[{i:1,rot:90},{i:0,rot:0}]});out=await PDFDocument.load(m.result.bytes);
ck('export order+rot',out.getPage(0).getSize().width===200&&out.getPage(0).getRotation().angle===90&&out.getPage(1).getSize().width===100);
ck('empty',(await run('inspect',{file:mkfile('e.pdf',new Uint8Array())})).code==='empty');
ck('corrupt',(await run('inspect',{file:mkfile('x.pdf',new TextEncoder().encode('hello, not a pdf'))})).code==='bad');
ck('truncated',(await run('inspect',{file:mkfile('t.pdf',(await pdf([10])).slice(0,60))})).code==='bad');
{const r=await run('merge',{files:[A,mkfile('junk.pdf',new TextEncoder().encode('%PDF-1.4 garbage'))]});ck('merge reports bad file name',r.name==='junk.pdf'||(console.log(JSON.stringify(r).slice(0,200)),false))}
m=await run('zip',{entries:[{name:'a.txt',blob:new Blob(['hello'])},{name:'b.txt',blob:new Blob(['world'])}]});
ck('zip',m.type==='done'&&m.result.size>0);
console.log(`pass ${ok} fail ${bad}`);process.exit(bad?1:0);
