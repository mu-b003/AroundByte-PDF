import {t,lang,setLang} from './i18n.js';
import {$} from './ui.js';
import * as img from './tools/img2pdf.js';
import * as mrg from './tools/merge.js';
import * as org from './tools/organize.js';
import * as ext from './tools/extract.js';
import {home,settings,about,applyTheme} from './tools/pages.js';
import './strings.js';
const TOOLS=[home,img,mrg,org,ext,settings,about];
applyTheme();
const current=()=>TOOLS.find(x=>x.id===location.hash.slice(1))||TOOLS[0];
function render(){
  const tool=current(),l=lang();
  document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';
  $('#nav').innerHTML=TOOLS.map(x=>`<a href="#${x.id}" ${x===tool?'aria-current="page"':''}>${x.icon}${t(x.titleKey)}</a>`).join('');
  $('#title').textContent=t(tool.titleKey);$('#desc').textContent=t(tool.descKey);
  $('#priv').textContent=t('priv');$('#lang').textContent=l==='en'?'العربية':'English';
  document.title=`${t(tool.titleKey)} — AroundByte PDF`;
  tool.mount($('#view'),TOOLS,render);
}
$('#lang').onclick=()=>{setLang(lang()==='en'?'ar':'en');render()};
addEventListener('hashchange',render);
render();
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
const originalSetLang=setLang;
$('#lang').addEventListener('click',updateLegalLinks);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
