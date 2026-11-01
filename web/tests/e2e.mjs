// Browser end-to-end suite (Playwright + Chromium). NOT yet executed by the author: see TESTING.md.
// Setup: npm i && npx playwright install chromium ; in another terminal: node serve.mjs ; then: node tests/e2e.mjs
import {chromium} from 'playwright';import fs from 'fs';import os from 'os';import path from 'path';import vm from 'vm';import {fileURLToPath} from 'url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..'),URL_='http://localhost:8080/',out=path.join(root,'tests/out');fs.mkdirSync(out,{recursive:true});
for(const f of['pdf-lib','jszip'])vm.runInThisContext(fs.readFileSync(path.join(root,`vendor/${f}.min.js`),'utf8'));
const {PDFDocument}=PDFLib,res=[],ck=(n,c,d='')=>{res.push({n,ok:!!c,d});console.log(c?'PASS':'FAIL',n,d)};
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'abpdf-')),profile=path.join(tmp,'profile'),fx=p=>path.join(tmp,p);
const mkpdf=async(n,w=300)=>{const d=await PDFDocument.create();for(let i=0;i<n;i++)d.addPage([w+i*10,200]);return Buffer.from(await d.save())};
fs.writeFileSync(fx('a.pdf'),await mkpdf(3));fs.writeFileSync(fx('b.pdf'),await mkpdf(2));fs.writeFileSync(fx('five.pdf'),await mkpdf(5));
fs.writeFileSync(fx('big1.pdf'),await mkpdf(400));fs.writeFileSync(fx('big2.pdf'),await mkpdf(400));
fs.writeFileSync(fx('corrupt.pdf'),'%PDF-1.4 this is not really a pdf');fs.writeFileSync(fx('empty.pdf'),'');fs.writeFileSync(fx('text.pdf'),'hello world');
const launch=()=>chromium.launchPersistentContext(profile,{headless:true,acceptDownloads:true,viewport:{width:1440,height:900}});
let ctx=await launch(),page=ctx.pages()[0]||await ctx.newPage();
const hosts=new Set();page.on('request',r=>hosts.add(new URL(r.url()).host));
const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto(URL_);
// Generate real image fixtures in the browser (noisy so compression has something to remove)
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
  ck(`img2pdf ${size} ${orient}`,pdf.getPageCount()===4&&Math.abs(coverSize.width-595.28)<1&&Math.abs(coverSize.height-841.89)<1&&Math.abs(s.width-w)<1&&Math.abs(s.height-h)<1,`${s.width}x${s.height}`)}
for(const fit of['contain','cover','actual']){await page.selectOption('#fit',fit);await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});ck('img2pdf fit '+fit,(await PDFDocument.load(await dl())).getPageCount()===4)}
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
// 5 Compress (all formats) + ZIP
await go('compress');await page.setInputFiles('#fi',['img.png','img.jpg','img.webp'].map(fx));await page.waitForSelector('.row:nth-child(3)');
for(const f of['jpeg','webp','png']){await page.selectOption('#fmt',f);await page.fill('#maxW','800');await page.click('#go');await page.waitForFunction(()=>document.querySelectorAll('[data-dl]').length===3,null,{timeout:60000});
  const info=await page.$$eval('.row small',e=>e.map(x=>x.textContent));ck('compress '+f+' produced results',info.length===3,info[0])}
await page.selectOption('#fmt','jpeg');await page.fill('#maxW','800');await page.click('#go');await page.waitForFunction(()=>document.querySelectorAll('[data-dl]').length===3);
const [zd]=await Promise.all([page.waitForEvent('download'),page.click('#zip')]);const zp=fx('z.zip');await zd.saveAs(zp);
const z=await JSZip.loadAsync(fs.readFileSync(zp));ck('zip entries',Object.keys(z.files).length>=1,Object.keys(z.files).join(','));
// 6 Cancel + responsiveness + memory on large merge
await go('merge');await page.setInputFiles('#fi',[fx('big1.pdf'),fx('big2.pdf')]);await page.waitForSelector('.row:nth-child(2)');
await page.evaluate(()=>{window.__gap=0;let l=performance.now();(function f(){const n=performance.now();window.__gap=Math.max(window.__gap,n-l);l=n;requestAnimationFrame(f)})()});
const heap0=await page.evaluate(()=>performance.memory?.usedJSHeapSize||0);
await page.click('#go');await page.click('#stop');await page.waitForTimeout(500);
ck('cancel re-enables UI',await page.isEnabled('#go')&&(await toast()).length>0,await toast());
await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:120000});const big=await PDFDocument.load(await dl());
ck('large merge integrity',big.getPageCount()===800);ck('UI stayed responsive (max frame gap < 250ms)',(await page.evaluate(()=>window.__gap))<250,String(await page.evaluate(()=>window.__gap)));
const heap1=await page.evaluate(()=>performance.memory?.usedJSHeapSize||0);ck('main-thread heap growth < 100MB',heap1-heap0<1e8,`${((heap1-heap0)/1e6).toFixed(1)}MB`);
// 7 Language / RTL / viewports
for(const [lang,dir] of[['ar','rtl'],['en','ltr']])for(const [name,w,h] of[['desktop',1440,900],['tablet',820,1180],['mobile',390,844]]){
  await page.setViewportSize({width:w,height:h});await page.evaluate(l=>localStorage.setItem('abpdf-lang',l),lang);
  for(const t of['home','img2pdf','merge','organize','extract','compress','recent','settings','about']){await page.goto(URL_+'#'+t);await page.reload();
    ck(`${lang}/${name}/${t} dir+no h-overflow`,await page.evaluate(d=>document.documentElement.dir===d&&document.documentElement.scrollWidth<=innerWidth+1,dir));
    if(t==='img2pdf'||t==='home')await page.screenshot({path:path.join(out,`${lang}-${name}-${t}.png`)})}}
await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>localStorage.setItem('abpdf-lang','ar'));await page.goto(URL_);await page.reload();
ck('RTL sidebar on the right',await page.evaluate(()=>document.querySelector('.side').getBoundingClientRect().left>innerWidth/2));
await page.evaluate(()=>localStorage.setItem('abpdf-lang','en'));
// 8 History persistence across refresh and browser restart
await page.goto(URL_+'#recent');await page.reload();const n1=(await page.$$('.row')).length;ck('history persists after refresh',n1>=8,String(n1));
await ctx.close();ctx=await launch();page=ctx.pages()[0]||await ctx.newPage();await page.goto(URL_+'#recent');
ck('history persists after browser restart',(await page.$$('.row')).length===n1);
// 9 Offline
await page.goto(URL_);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.waitForTimeout(500);
await ctx.setOffline(true);await page.reload();ck('offline: app loads',(await page.title()).includes('AroundByte'));
await go('img2pdf');await page.setInputFiles('#fi',fx('img.jpg'));await page.waitForSelector('.row');await page.click('#go');await page.waitForSelector('#dlg[open]',{timeout:60000});
ck('offline: image to PDF works',(await PDFDocument.load(await dl())).getPageCount()===2);
await go('compress');await page.setInputFiles('#fi',fx('img.png'));await page.click('#go');await page.waitForSelector('[data-dl]');ck('offline: compressor works',true);
await go('organize');await page.setInputFiles('#fi',fx('five.pdf'));await page.waitForSelector('.card:nth-child(5) img[src]');ck('offline: PDF.js thumbnails work',true);
await ctx.setOffline(false);
ck('no external hosts contacted',[...hosts].every(h=>h==='localhost:8080'),[...hosts].join(','));ck('no uncaught page errors',errs.length===0,errs.join(' | '));
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(res,null,1));await ctx.close();
console.log(`\n${res.filter(r=>r.ok).length}/${res.length} passed. Report: tests/out/report.json, screenshots in tests/out/`);process.exit(res.every(r=>r.ok)?0:1);
