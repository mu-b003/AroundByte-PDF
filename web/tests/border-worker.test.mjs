import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
const base=process.cwd();
let message;
const ctx={console,Blob,File,TextDecoder,Uint8Array,ArrayBuffer,Map,Set,Math,Number,String,Promise,URL,fetch,OffscreenCanvas:undefined};
ctx.self={postMessage(m){message=m}};
ctx.importScripts=(rel)=>{const p=new URL(rel,pathToFileURL(base+'/js/workers/task.worker.js'));vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:p.pathname})};
const context=vm.createContext(ctx);
vm.runInContext(fs.readFileSync('vendor/pdf-lib.min.js','utf8'),context,{filename:'pdf-lib.min.js'});
vm.runInContext(fs.readFileSync('js/workers/task.worker.js','utf8'),context,{filename:'task.worker.js'});
const bytes=await vm.runInContext('(async()=>{const d=await PDFLib.PDFDocument.create();const f=await d.embedFont(PDFLib.StandardFonts.Helvetica);for(const size of [[612,792],[595,842]]){const p=d.addPage(size);p.drawText(\"KEEP ORIGINAL VECTOR TEXT\",{x:70,y:700,size:14,font:f})}return await d.save()})()',context);
const file=new File([bytes],'test.pdf',{type:'application/pdf'});
for(const preset of ['classic','double','minimal','corner','rounded','dotted','dashed','geometric','artdeco','botanical','certificate','ornate']){
 message=null;await context.self.onmessage({data:{op:'border',payload:{file,preset,color:'#ffc400',thickness:2,inset:24,mode:'all',range:''}}});
 if(!message||message.type!=='done')throw new Error(`${preset}: ${JSON.stringify(message)}`);
 const check=await vm.runInContext('(async b=>{const d=await PDFLib.PDFDocument.load(b);return d.getPageCount()})',context)(message.result.bytes);
 if(check!==2)throw new Error(`${preset}: bad page count ${check}`);
 const preserved=await vm.runInContext('(async b=>{const d=await PDFLib.PDFDocument.load(b);return d.getPages().every(p=>!!p.node.Contents())})',context)(message.result.bytes);
 if(!preserved)throw new Error(`${preset}: original page content stream missing`);
 console.log('PASS',preset, message.result.bytes.length);
}
message=null;await context.self.onmessage({data:{op:'border',payload:{file,preset:'classic',color:'#ffc400',thickness:2,inset:24,mode:'custom',range:'1-2'}}});
if(message?.type!=='done')throw new Error('custom range failed '+JSON.stringify(message));
message=null;await context.self.onmessage({data:{op:'border',payload:{file,preset:'classic',color:'#ffc400',thickness:2,inset:24,mode:'custom',range:'0,2'}}});
if(message?.code!=='badrange')throw new Error('invalid range not rejected '+JSON.stringify(message));
console.log('PASS custom ranges and invalid range validation');
console.log('Border worker tests: 14 passed, 0 failed');
