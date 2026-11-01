import {t,lang} from '../i18n.js';
import {$,esc,fmt,ICON} from '../ui.js';
import {listHistory,removeHistory,clearHistory} from '../history.js';
export const id='recent',titleKey='recTitle',descKey='recDesc',icon=ICON.clock;
export async function mount(root){
  const rows=await listHistory(),df=new Intl.DateTimeFormat(lang()==='ar'?'ar':'en',{dateStyle:'medium',timeStyle:'short'});
  root.innerHTML=rows.length?`<div class="bar"><span>${t('note')}</span><span class="sp"></span><button class="btn" id="clr">${t('clear')}</button></div>
  <div class="list">${rows.map(r=>`<div class="row"><div class="meta"><b>${esc(r.name)}</b><small>${t(r.op)} · ${r.pages?t('pages',{n:r.pages})+' · ':''}${fmt(r.size)} · ${df.format(r.date)}</small></div>
  <button class="icon" data-id="${r.id}" title="${t('remove')}" aria-label="${t('remove')}">${ICON.x}</button></div>`).join('')}</div>`
  :`<div class="empty"><strong>${t('recEmpty')}</strong><p>${t('recEmptySub')}</p></div>`;
  root.onclick=async e=>{const b=e.target.closest('[data-id]');
    if(b){await removeHistory(+b.dataset.id);mount(root)}
    else if(e.target.id==='clr'&&confirm(t('confirmClear'))){await clearHistory();mount(root)}};
}
