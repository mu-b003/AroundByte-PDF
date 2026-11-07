// Browser end-to-end suite (Playwright + Chromium). See TESTING.md for setup and current verification status.
// Setup: npm ci && npx playwright install chromium ; then: node tests/e2e.mjs (starts the local server if needed).
import {chromium} from 'playwright';import fs from 'fs';import os from 'os';import path from 'path';import vm from 'vm';import {fileURLToPath} from 'url';import {spawn} from 'child_process';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),URL_='http://localhost:8080/',out=path.join(root,'tests/out');fs.mkdirSync(out,{recursive:true});
let server=null,serverReady=false;
try{serverReady=(await fetch(URL_)).ok}catch{}
if(!serverReady){server=spawn(process.execPath,[path.join(root,'serve.mjs'),'8080'],{cwd:root,stdio:'ignore'});let ready=false;for(let i=0;i<50;i++){try{const r=await fetch(URL_);if(r.ok){ready=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,100))}if(!ready){server.kill();throw new Error('Could not start the local test server on port 8080')}}
process.on('exit',()=>server?.kill());
for(const f of['pdf-lib','jszip'])vm.runInThisContext(fs.readFileSync(path.join(root,`vendor/${f}.min.js`),'utf8'));
const {PDFDocument}=PDFLib,res=[],ck=(n,c,d='')=>{res.push({n,ok:!!c,d});console.log(c?'PASS':'FAIL',n,d)};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'abpdf-')),profile=path.join(tmp,'profile'),fx=p=>path.join(tmp,p);
const mkpdf=async(n,w=300)=>{const d=await PDFDocument.create();for(let i=0;i<n;i++)d.addPage([w+i*10,200]);return Buffer.from(await d.save())};
fs.writeFileSync(fx('a.pdf'),await mkpdf(3));fs.writeFileSync(fx('b.pdf'),await mkpdf(2));fs.writeFileSync(fx('five.pdf'),await mkpdf(5));
fs.writeFileSync(fx('big1.pdf'),await mkpdf(400));fs.writeFileSync(fx('big2.pdf'),await mkpdf(400));
fs.writeFileSync(fx('corrupt.pdf'),'%PDF-1.4 this is not really a pdf');fs.writeFileSync(fx('empty.pdf'),'');fs.writeFileSync(fx('text.pdf'),'hello world');
const launch=()=>chromium.launchPersistentContext(profile,{headless:true,acceptDownloads:true,viewport:{width:1440,height:900}});
let ctx=await launch(),page=ctx.pages()[0]||await ctx.newPage();
const requests=[];page.on('request',r=>requests.push(r.url()));
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(URL_);
// Generate local image fixtures in the browser for Image to PDF.
const imgs=await page.evaluate(async()=>{const o={};for(const [k,t] of[['png','image/png'],['jpg','image/jpeg'],['webp','image/webp']]){
  const c=document.createElement('canvas');c.width=1600;c.height=1000;const g=c.getContext('2d');
  for(let i=0;i<4000;i++){g.fillStyle=`hsl(${Math.random()*360},70%,50%)`;g.fillRect(Math.random()*1600,Math.random()*1000,40,40)}
  o[k]=c.toDataURL(t,1).split(',')[1]}return o});
for(const k in imgs)fs.writeFileSync(fx('img.'+k),Buffer.from(imgs[k],'base64'));
const go=h=>page.evaluate(h=>location.hash=h,h).then(()=>page.waitForTimeout(150));
const dl=async()=>{const [d]=await Promise.all([page.waitForEvent('download'),page.click('#rd')]);const p=fx('dl-'+Date.now()+'-'+d.suggestedFilename());await d.saveAs(p);await page.click('#rc');return fs.readFileSync(p)};
const toast=()=>page.textContent('#toast');

// 1 Image to PDF (portrait/landscape, sizes)
await go('img2pdf');await page.setInputFiles('#fi',['img.png','img.jpg','img.webp'].map(fx));await page.waitForSelector('.row:nth-child(3)');
for(const [size,orient,w,h] of[['a4','portrait',595.28,841.89],['a4','landscape',841.89,595.28],['letter','portrait',612,792],['a3','portrait',841.89,1190.55]]){
  await page.selectOption('#size',size);await page.selectOption('#orient',orient);await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});
  const pdf=await PDFDocument.load(await dl()),coverSize=pdf.getPage(0).getSize(),s=pdf.getPage(1).getSize();
  ck(`img2pdf ${size} ${orient}`,pdf.getPageCount()===3&&Math.abs(coverSize.width-w)<1&&Math.abs(coverSize.height-h)<1,`${coverSize.width}x${coverSize.height}`)}
for(const fit of['contain','cover','actual']){await page.selectOption('#fit',fit);await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});ck('img2pdf fit '+fit,(await PDFDocument.load(await dl())).getPageCount()===3)}
await page.check('#addCover');await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});ck('img2pdf optional cover',(await PDFDocument.load(await dl())).getPageCount()===4);await page.uncheck('#addCover');
// 2 Merge (order) + invalid files
await go('merge');await page.setInputFiles('#fi',[fx('corrupt.pdf'),fx('empty.pdf'),fx('text.pdf')]);await page.waitForTimeout(1500);
ck('merge rejects invalid',(await page.$$('.row')).length===0);
await page.setInputFiles('#fi',[fx('a.pdf'),fx('b.pdf')]);await page.waitForSelector('.row:nth-child(2)');
await page.click('.row:nth-child(2) [data-act=up]');await page.click('#go');await page.waitForSelector('#dlg[open]');
const m=await PDFDocument.load(await dl());ck('merge order+count',m.getPageCount()===5&&m.getPage(0).getSize().width===300&&m.getPage(2).getSize().width===300,'b then a');
// 3 Organize
await go('organize');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForSelector('.card:nth-child(5) img[src]');
await page.click('.card:nth-child(1) [data-act=rot]');await page.dragAndDrop('.card:nth-child(5)','.card:nth-child(1)');
await page.click('.card:nth-child(3) input');page.once('dialog',d=>d.accept());await page.click('#del');await page.waitForTimeout(300);
await page.click('#go');await page.waitForSelector('#dlg[open]');const o=await PDFDocument.load(await dl());
ck('organize count',o.getPageCount()===4);ck('organize reorder',o.getPage(0).getSize().width===340,'page5 first');ck('organize rotation',o.getPage(1).getRotation().angle===90);
// 4 Extract
await go('extract');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForSelector('.card:nth-child(5)');
await page.fill('#rg','9');ck('extract invalid range message',(await page.textContent('#err')).length>0);
await page.fill('#rg','1-2, 4');await page.click('#go');await page.waitForSelector('#dlg[open]');
const x=await PDFDocument.load(await dl());ck('extract pages',x.getPageCount()===3&&x.getPage(2).getSize().width===330);
// 5 Added PDF utilities
await go('rotate');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForFunction(()=>document.querySelector('#fileInfo').textContent.includes('five.pdf'));await page.fill('#angle','90');await page.click('#go');await page.waitForSelector('#dlg[open]');
const rotated=await PDFDocument.load(await dl());ck('rotate utility',rotated.getPageCount()===5&&rotated.getPage(0).getRotation().angle===90);
await go('watermark');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForFunction(()=>document.querySelector('#fileInfo').textContent.includes('five.pdf'));await page.fill('#text','CONFIDENTIAL');await page.click('#go');await page.waitForSelector('#dlg[open]');
const marked=await PDFDocument.load(await dl());ck('watermark utility',marked.getPageCount()===5);
await go('watermark');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForFunction(()=>document.querySelector('#fileInfo').textContent.includes('five.pdf'));
await page.fill('#text','علامة مائية سرية');await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});
const arabicMarked=await dl();
const arabicPixels=await page.evaluate(async base64=>{
  const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
  const pg=await pdf.getPage(1),viewport=pg.getViewport({scale:1});
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false});
  await pg.render({canvasContext:ctx,viewport}).promise;
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
  let count=0;for(let i=0;i<data.length;i+=4)if(data[i]<250&&data[i+1]<250&&data[i+2]<250)count++;
  return count;
},arabicMarked.toString('base64'));
const arabicPdf=await PDFDocument.load(arabicMarked);
ck('Arabic watermark creates valid PDF',arabicPdf.getPageCount()===5);
ck('Arabic watermark renders visible content',arabicPixels>10,`non-white pixels=${arabicPixels}`);
await go('numbers');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForFunction(()=>document.querySelector('#fileInfo').textContent.includes('five.pdf'));await page.click('#go');await page.waitForSelector('#dlg[open]');
const numbered=await PDFDocument.load(await dl());ck('page number utility',numbered.getPageCount()===5);
await go('metadata');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForFunction(()=>document.querySelector('#fileInfo').textContent.includes('five.pdf'));await page.locator('.panel input#title').fill('AroundByte E2E');await page.fill('#author','Test Author');await page.click('#go');await page.waitForSelector('#dlg[open]');
const metapdf=await PDFDocument.load(await dl());ck('metadata utility',metapdf.getTitle()==='AroundByte E2E'&&metapdf.getAuthor()==='Test Author');
for(const [route,ext] of [['pdf-to-jpg','jpg'],['pdf-to-png','png']]){await go(route);await page.setInputFiles('#fi',fx('a.pdf'));await page.waitForFunction(()=>document.querySelector('#info').textContent.includes('a.pdf'));await page.waitForFunction(()=>!document.querySelector('#go').disabled);await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});
  const [ad]=await Promise.all([page.waitForEvent('download'),page.click('#rd')]);const ap=fx('images-'+route+'.zip');await ad.saveAs(ap);await page.click('#rc');const archive=await JSZip.loadAsync(fs.readFileSync(ap));
  ck(route+' archive pages',Object.keys(archive.files).filter(n=>n.endsWith('.'+ext)).length===3)}
// 6 Cancel + responsiveness + memory on large merge
await go('merge');await page.setInputFiles('#fi',[fx('big1.pdf'),fx('big2.pdf')]);await page.waitForSelector('.row:nth-child(2)');
const heap0=await page.evaluate(()=>performance.memory?.usedJSHeapSize||0);
await page.click('#go');await page.click('#stop');await page.waitForTimeout(500);
ck('cancel re-enables UI',await page.isEnabled('#go')&&(await toast()).length>0,await toast());

await page.evaluate(()=>{
  const m=window.__uiGap={active:false,last:0,max:0,frames:0,finished:false};
  const dlg=document.querySelector('#dlg');
  document.querySelector('#go').addEventListener('click',()=>{
    m.active=true;
    m.last=performance.now();
  },{capture:true,once:true});
  const observer=new MutationObserver(()=>{
    if(dlg.open&&m.active){
      m.active=false;
      m.finished=true;
      observer.disconnect();
    }
  });
  observer.observe(dlg,{attributes:true,attributeFilter:['open']});
  (function tick(){
    const now=performance.now();
    if(m.active){
      m.max=Math.max(m.max,now-m.last);
      m.frames++;
    }
    m.last=now;
    requestAnimationFrame(tick);
  })();
});

await page.click('#go');
await page.waitForSelector('#dlg[open]',{timeout:120000});
const gapData=await page.evaluate(()=>({...window.__uiGap}));
const bigBytes=await dl();
const big=await PDFDocument.load(bigBytes);
const bigCount=big.getPageCount();

ck('large merge integrity',bigCount===800,`actual=${bigCount}; expected=800; bytes=${bigBytes.length}`);
ck('UI stayed responsive (max frame gap < 250ms)',gapData.finished&&gapData.frames>0&&gapData.max<250,JSON.stringify(gapData));

const heap1=await page.evaluate(()=>performance.memory?.usedJSHeapSize||0);ck('main-thread heap growth < 100MB',heap1-heap0<1e8,`${((heap1-heap0)/1e6).toFixed(1)}MB`);
// Split PDF is a legacy SEO alias for Extract PDF Pages, not a separate tool.
await go('split');await page.waitForTimeout(100);ck('split alias routes to extract',await page.evaluate(()=>location.hash==='#extract'));

// 7 Language / RTL / viewports
for(const [lang,dir] of[['ar','rtl'],['en','ltr']])for(const [name,w,h] of[['desktop',1440,900],['tablet',820,1180],['mobile',390,844]]){
  await page.setViewportSize({width:w,height:h});await page.evaluate(l=>localStorage.setItem('abpdf-lang',l),lang);
  for(const t of['home','img2pdf','merge','organize','extract','rotate','watermark','numbers','metadata','pdf-to-jpg','pdf-to-png','compress','image-to-text','sign','fill-forms','redact','repair','recent','settings','about']){await page.goto(URL_+'#'+t);await page.reload();
    ck(`${lang}/${name}/${t} dir+no h-overflow`,await page.evaluate(d=>document.documentElement.dir===d&&document.documentElement.scrollWidth<=innerWidth+1,dir));
    if(t==='img2pdf'||t==='home')await page.screenshot({path:path.join(out,`${lang}-${name}-${t}.png`)})}}
await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>localStorage.setItem('abpdf-lang','ar'));await page.goto(URL_);await page.reload();
ck('RTL sidebar on the right',await page.evaluate(()=>document.querySelector('.side').getBoundingClientRect().left>innerWidth/2));
await page.evaluate(()=>localStorage.setItem('abpdf-lang','en'));
// 9 Offline
await page.goto(URL_);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForTimeout(500);
await ctx.setOffline(true);await page.reload();ck('offline: app loads',(await page.title()).includes('AroundByte'));
await go('img2pdf');await page.setInputFiles('#fi',fx('img.jpg'));await page.waitForSelector('.row');await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});
ck('offline: image to PDF works',(await PDFDocument.load(await dl())).getPageCount()===1);
await go('rotate');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForSelector('#fileInfo');await page.click('#go');await page.waitForSelector('#dlg[open]');ck('offline: rotate works',(await PDFDocument.load(await dl())).getPageCount()===5);
await go('organize');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForSelector('.card:nth-child(5) img[src]');ck('offline: PDF.js thumbnails work',true);
await ctx.setOffline(false);
const parsed=requests.map(u=>{const x=new URL(u);return{url:u,protocol:x.protocol,host:x.host}});
const external=parsed.filter(x=>['http:','https:','ws:','wss:'].includes(x.protocol)&&x.host!=='localhost:8080');
const hostless=parsed.filter(x=>!x.host);
ck('no external hosts contacted',external.length===0,`external=${JSON.stringify(external)}; hostless=${JSON.stringify(hostless)}`);ck('no uncaught page errors',errs.length===0,errs.join(' | '));
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(res,null,1));await ctx.close();
console.log(`\n${res.filter(r=>r.ok).length}/${res.length} passed. Report: tests/out/report.json, screenshots in tests/out/`);process.exit(res.every(r=>r.ok)?0:1);
