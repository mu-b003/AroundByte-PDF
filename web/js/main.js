import {t,lang,setLang} from './i18n.js';
import {$,toast} from './ui.js';
import * as img from './tools/img2pdf.js';
import * as mrg from './tools/merge.js';
import * as org from './tools/organize.js';
import * as ext from './tools/extract.js';
import {rotate,watermark,numbers,metadata} from './tools/advanced.js';
import {pdfToJpg,pdfToPng} from './tools/pdf-to-image.js';
import {home,settings,about,applyTheme} from './tools/pages.js';
import * as recent from './tools/recent.js';
import * as compress from './tools/compress.js';
import * as sign from './tools/sign.js';
import * as forms from './tools/forms.js';
import * as redact from './tools/redact.js';
import * as repair from './tools/repair.js';
import './strings.js';
const TOOLS=[home,img,mrg,org,ext,rotate,watermark,numbers,metadata,pdfToJpg,pdfToPng,compress,sign,forms,redact,repair,recent,settings,about];
applyTheme();
const current=()=>TOOLS.find(x=>x.id===location.hash.slice(1))||TOOLS[0];
let activeTool=null;
function render(reason='route'){
  const tool=current(),l=lang();
  if(activeTool!==tool){
    activeTool?.unmount?.();
    activeTool=tool;
  }else if(reason==='language'){
    activeTool?.unmount?.({preserveState:true});
  }
  document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';
  $('#nav').innerHTML=TOOLS.map(x=>`<a href="#${x.id}" ${x===tool?'aria-current="page"':''}>${x.icon}${t(x.titleKey)}</a>`).join('');
  $('#title').textContent=t(tool.titleKey);$('#desc').textContent=t(tool.descKey);
  $('#priv').textContent=t('priv');$('#lang').textContent=l==='en'?'العربية':'English';
  document.title=`${t(tool.titleKey)} — AroundByte PDF`;
  tool.mount($('#view'),TOOLS,render);
}
$('#lang').onclick=()=>{setLang(lang()==='en'?'ar':'en');render('language')};
const normalizeRoute=()=>{if(['#split','#split-pdf'].includes(location.hash)){location.hash='extract';toast(t('splitAliasToast'));return true}return false};
addEventListener('hashchange',()=>{if(!normalizeRoute())render()});
if(!normalizeRoute())render();
const footerYear=document.querySelector('#footerYear');
if(footerYear)footerYear.textContent=new Date().getFullYear();
const footerLinks=document.querySelectorAll('[data-legal]');
const legalLabels={
  en:['About Us','Contact Us','Privacy Policy','Terms of Use','Cookie Policy','Disclaimer'],
  ar:['من نحن','اتصل بنا','سياسة الخصوصية','شروط الاستخدام','سياسة ملفات تعريف الارتباط','إخلاء المسؤولية']
};
function updateLegalLinks(){
  const labels=legalLabels[lang()];
  footerLinks.forEach((link,index)=>{if(labels[index])link.textContent=labels[index]});
}
updateLegalLinks();
$('#lang').addEventListener('click',updateLegalLinks);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
