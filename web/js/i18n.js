const D={en:{
imgTitle:'Image to PDF',imgDesc:'Combine images into one PDF, in the order you choose.',
mrgTitle:'Merge PDF',mrgDesc:'Join several PDF files into a single document.',
priv:'Files are processed in your browser and never uploaded.',
dropImg:'Drop images here or click to browse',dropImgSub:'JPG, PNG, WebP, BMP or GIF',
dropPdf:'Drop PDF files here or click to browse',dropPdfSub:'Add two or more PDFs',
selAll:'Select all',selNone:'Deselect all',selected:'{n} of {m} selected',files:'{n} files',
up:'Move up',down:'Move down',remove:'Remove',
settings:'Page settings',size:'Page size',orig:'Original image size',custom:'Custom',w:'Width (mm)',h:'Height (mm)',
orient:'Orientation',portrait:'Portrait',landscape:'Landscape',margin:'Margin (mm)',
fit:'Image fit',fitContain:'Fit to page',fitCover:'Fill page (crops edges)',fitActual:'Actual size (never enlarged)',
quality:'JPEG quality',fname:'File name',create:'Create PDF',merge:'Merge PDFs',cancel:'Cancel',
working:'Processing {a} of {b}…',cancelled:'Cancelled.',
preview:'Preview',download:'Download',close:'Close',done:'PDF ready',
noSel:'Select at least one item.',needTwo:'Add at least two PDFs to merge.',
badImg:'“{f}” is not a readable image.',emptyF:'“{f}” is empty.',badPdf:'“{f}” is not a valid PDF.',encPdf:'“{f}” is password-protected. Remove the password first.',
failed:'Something went wrong',pages:'{n} pages',verifyFail:'The generated file failed verification. Try again.',
recEmpty:'Nothing here yet',recEmptySub:'Files you create will be listed here. The files themselves are saved by your browser, not by AroundByte.',
clear:'Clear history',confirmClear:'Clear all history entries?',op_img:'Image to PDF',op_merge:'Merge PDF',
note:'Only names, sizes and dates are stored on this device. Original files are never kept.'
},ar:{
imgTitle:'تحويل الصور إلى PDF',imgDesc:'ادمج الصور في ملف PDF واحد بالترتيب الذي تختاره.',
mrgTitle:'دمج ملفات PDF',mrgDesc:'اجمع عدة ملفات PDF في مستند واحد.',
priv:'تتم معالجة الملفات داخل متصفحك ولا يتم رفعها أبدًا.',
dropImg:'أسقط الصور هنا أو انقر للاستعراض',dropImgSub:'JPG وPNG وWebP وBMP وGIF',
dropPdf:'أسقط ملفات PDF هنا أو انقر للاستعراض',dropPdfSub:'أضف ملفين أو أكثر',
selAll:'تحديد الكل',selNone:'إلغاء التحديد',selected:'تم تحديد {n} من {m}',files:'{n} ملفات',
up:'نقل للأعلى',down:'نقل للأسفل',remove:'إزالة',
settings:'إعدادات الصفحة',size:'حجم الصفحة',orig:'حجم الصورة الأصلي',custom:'مخصص',w:'العرض (مم)',h:'الارتفاع (مم)',
orient:'الاتجاه',portrait:'عمودي',landscape:'أفقي',margin:'الهامش (مم)',
fit:'ملاءمة الصورة',fitContain:'ملاءمة الصفحة',fitCover:'تعبئة الصفحة (قص الحواف)',fitActual:'الحجم الفعلي (دون تكبير)',
quality:'جودة JPEG',fname:'اسم الملف',create:'إنشاء PDF',merge:'دمج الملفات',cancel:'إلغاء',
working:'جارٍ معالجة {a} من {b}…',cancelled:'تم الإلغاء.',
preview:'معاينة',download:'تنزيل',close:'إغلاق',done:'ملف PDF جاهز',
noSel:'حدد عنصرًا واحدًا على الأقل.',needTwo:'أضف ملفي PDF على الأقل للدمج.',
badImg:'الملف «{f}» ليس صورة قابلة للقراءة.',emptyF:'الملف «{f}» فارغ.',badPdf:'الملف «{f}» ليس PDF صالحًا.',encPdf:'الملف «{f}» محمي بكلمة مرور. أزل كلمة المرور أولًا.',
failed:'حدث خطأ ما',pages:'{n} صفحات',verifyFail:'فشل التحقق من الملف الناتج. حاول مرة أخرى.',
recEmpty:'لا يوجد شيء بعد',recEmptySub:'ستظهر هنا الملفات التي تنشئها. يحفظ المتصفح الملفات نفسها، وليس AroundByte.',
clear:'مسح السجل',confirmClear:'هل تريد مسح كل عناصر السجل؟',op_img:'تحويل الصور إلى PDF',op_merge:'دمج PDF',
note:'يتم حفظ الأسماء والأحجام والتواريخ فقط على هذا الجهاز. لا يتم الاحتفاظ بالملفات الأصلية.'
}};
let L=localStorage.getItem('abpdf-lang')||'en';
export const lang=()=>L;
export function setLang(l){L=l;localStorage.setItem('abpdf-lang',l)}
export const t=(k,v={})=>(D[L][k]??D.en[k]??k).replace(/\{(\w+)\}/g,(_,x)=>v[x]??'');
export const addStrings=(e,a)=>{Object.assign(D.en,e);Object.assign(D.ar,a)};
