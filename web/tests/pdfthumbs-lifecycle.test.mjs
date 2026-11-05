import assert from 'node:assert/strict';

let passed=0,failed=0;
async function test(name,fn){
  try{await fn();passed++;console.log(`PASS ${name}`)}
  catch(error){failed++;console.error(`FAIL ${name}`);console.error(error)}
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));

const observers=[];
class FakeIntersectionObserver{
  constructor(callback){this.callback=callback;this.targets=new Set();this.disconnected=false;observers.push(this)}
  observe(target){this.targets.add(target)}
  unobserve(target){this.targets.delete(target)}
  disconnect(){this.disconnected=true;this.targets.clear()}
  trigger(){this.callback([...this.targets].map(target=>({target,isIntersecting:true})));}
}
globalThis.IntersectionObserver=FakeIntersectionObserver;
globalThis.devicePixelRatio=1;
globalThis.localStorage={getItem:()=> 'en',setItem:()=>{}};

const createdUrls=[],revokedUrls=[];
let urlId=0;
const originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
URL.createObjectURL=blob=>{assert.ok(blob instanceof Blob);const url=`blob:test-${++urlId}`;createdUrls.push(url);return url};
URL.revokeObjectURL=url=>revokedUrls.push(url);

class FakeHost{
  constructor(){this.images=[];this.listeners=new Map();this._html=''}
  set innerHTML(value){this._html=value;this.images=[...value.matchAll(/<img data-i="(\d+)"/g)].map(match=>({dataset:{i:match[1]},isConnected:true,src:'',datasetError:false}))}
  get innerHTML(){return this._html}
  querySelectorAll(selector){return selector==='img'?this.images:[]}
  addEventListener(type,handler){this.listeners.set(type,handler)}
  removeEventListener(type,handler){if(this.listeners.get(type)===handler)this.listeners.delete(type)}
}

let canvasFactory;
globalThis.document={createElement:()=>canvasFactory()};
let fakePdf;
globalThis.pdfjsLib={GlobalWorkerOptions:{},getDocument:()=>fakePdf};
const {grid,openPdf}=await import('../js/pdfthumbs.js');

function makeCanvas({toBlob}={}){
  return{width:0,height:0,getContext:()=>({}),toBlob:callback=>toBlob?toBlob(callback):callback(new Blob(['thumbnail'],{type:'image/jpeg'}))};
}
function makePdf({render}={}){
  const state={getPageCalls:0,cleanupCalls:0,renderTasks:[]};
  return{state,async getPage(){state.getPageCalls++;return{
    getViewport:({scale})=>({width:100*scale,height:150*scale}),
    render(){const task=render?render():{promise:Promise.resolve(),cancel(){}};state.renderTasks.push(task);return task},
    cleanup(){state.cleanupCalls++}
  }}};
}

await test('thumbnail URLs are cached and revoked on destroy',async()=>{
  createdUrls.length=0;revokedUrls.length=0;observers.length=0;
  canvasFactory=()=>makeCanvas();
  const pdf=makePdf(),host=new FakeHost(),pages=[{i:0,rot:0,sel:false}];
  const view=grid(host,pdf,pages);
  observers.at(-1).trigger();await tick();await tick();
  assert.equal(createdUrls.length,1);
  assert.equal(host.images[0].src,createdUrls[0]);
  view.destroy();view.destroy();
  assert.equal(revokedUrls.length,1);
  assert.equal(host.innerHTML,'');
  assert.equal(host.listeners.size,0);
  assert.equal(observers.at(-1).disconnected,true);
});

await test('destroy cancels an in-flight page render without creating an object URL',async()=>{
  createdUrls.length=0;revokedUrls.length=0;observers.length=0;
  let rejectRender,cancelled=false;
  canvasFactory=()=>makeCanvas();
  const pdf=makePdf({render:()=>({promise:new Promise((_,reject)=>{rejectRender=reject}),cancel(){cancelled=true;rejectRender(new Error('cancelled'))}})});
  const host=new FakeHost(),view=grid(host,pdf,[{i:0}]);
  observers.at(-1).trigger();await tick();
  view.destroy();await tick();
  assert.equal(cancelled,true);
  assert.equal(createdUrls.length,0);
  assert.equal(pdf.state.cleanupCalls,1);
});

await test('destroy during canvas encoding prevents late object URL creation',async()=>{
  createdUrls.length=0;revokedUrls.length=0;observers.length=0;
  let finishBlob,encodingStarted=false,canvas;
  canvasFactory=()=>{canvas=makeCanvas({toBlob:callback=>{encodingStarted=true;finishBlob=callback}});return canvas};
  const pdf=makePdf(),host=new FakeHost(),view=grid(host,pdf,[{i:0}]);
  observers.at(-1).trigger();
  for(let i=0;i<5&&!encodingStarted;i++)await tick();
  assert.equal(encodingStarted,true);
  view.destroy();
  finishBlob(new Blob(['late thumbnail'],{type:'image/jpeg'}));
  await tick();await tick();
  assert.equal(createdUrls.length,0);
  assert.equal(canvas.width,0);assert.equal(canvas.height,0);
});

await test('openPdf abort destroys the pending PDF.js loading task',async()=>{
  let rejectLoad,destroyed=false;
  fakePdf={promise:new Promise((_,reject)=>{rejectLoad=reject}),destroy(){destroyed=true;rejectLoad(new DOMException('aborted','AbortError'));return Promise.resolve()}};
  const controller=new AbortController();
  const file={name:'pending.pdf',size:10,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer};
  const pending=openPdf(file,{signal:controller.signal});
  await tick();controller.abort();
  await assert.rejects(pending,error=>error.name==='AbortError');
  assert.equal(destroyed,true);
});

URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke;
console.log(`\nPDF thumbnail lifecycle tests: ${passed} passed, ${failed} failed`);
process.exitCode=failed?1:0;
