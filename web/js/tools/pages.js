import {t,lang,setLang} from '../i18n.js';
import {$,ICON} from '../ui.js';
export const home={id:'home',titleKey:'homeTitle',descKey:'homeDesc',icon:ICON.home,
  mount(root,tools){
    const T=tools.filter(x=>!['home','settings','about','recent'].includes(x.id));
    const H={img2pdf:'hImg',merge:'hMrg',organize:'hOrg',extract:'hExt'};
    const ART={
      img2pdf:'img-to-pdf.webp',
      merge:'merge-pdf.webp',
      organize:'organize-pdf.webp',
      extract:'extract-pdf.webp',
      rotate:'Rotate PDF.webp',
      watermark:'Add PDF Watermark.webp',
      numbers:'Add Page Numbers.webp',
      metadata:'Edit PDF Metadata.webp',
      'pdf-to-jpg':'PDF to JPG.webp',
      'pdf-to-png':'PDF to PNG.webp',
      compress:'Compress PDF.png',
      'image-to-text':'Image to Text.png',
      sign:'Sign PDF.png',
      forms:'Fill PDF Forms.png',
      redact:'Redact PDF.png',
      repair:'Repair PDF.png'
    };
    root.innerHTML=`<div class="tiles">${T.map(x=>ART[x.id]?`<a class="tile tool-tile" href="#${x.id}" aria-label="${t(x.titleKey)}: ${t(x.descKey)}">
      <img class="tile-art" src="assets/tool-cards/${ART[x.id]}" alt="" loading="eager" decoding="async">
    </a>`:`<a class="tile tool-tile tool-tile-text" href="#${x.id}"><span class="tile-copy"><b>${t(x.titleKey)}</b><small>${t(x.descKey)}</small></span></a>`).join('')}</div>`;
  }};
export const settings={id:'settings',titleKey:'setTitle',descKey:'setDesc',icon:ICON.gear,
  mount(root,_,rerender){root.innerHTML=`<div class="panel plain"><label>${t('langLbl')}<select id="l"><option value="en">English</option><option value="ar">العربية</option></select></label>
  <label>${t('themeLbl')}<select id="th"><option value="dark">${t('themeDark')}</option><option value="light">${t('themeLight')}</option><option value="system">${t('themeSys')}</option></select></label></div>`;
    $('#l',root).value=lang();$('#th',root).value=localStorage.getItem('abpdf-theme')||'dark';
    $('#l',root).onchange=e=>{setLang(e.target.value);rerender()};
    $('#th',root).onchange=e=>{localStorage.setItem('abpdf-theme',e.target.value);applyTheme()}}};
export const about={id:'about',titleKey:'aboutTitle',descKey:'aboutDesc',icon:ICON.info,
  mount(root){root.innerHTML=`<div class="panel plain prose"><img src="assets/aroundbyte-icon.png" width="64" height="64" alt=""><p>${t('aboutP1')}</p><p>${t('aboutP2')}</p><p>${t('aboutP3')}</p><p><b>${t('contactLbl')}:</b> <a href="mailto:mubarakdigitals26@gmail.com">mubarakdigitals26@gmail.com</a></p></div>`}};
export function applyTheme(){const v=localStorage.getItem('abpdf-theme')||'dark';
  document.documentElement.dataset.theme=v==='system'?(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'):v}
