(() => {
'use strict';

const pages = {
about: {
en: {
title: 'About Us',
sections: [
['About AroundByte PDF', 'AroundByte PDF is a browser-based toolkit designed to help people work with PDF documents and images through a simple, practical interface.'],
['Our purpose', 'Our goal is to provide useful document tools that are straightforward to use, with a focus on privacy, accessibility and a clean experience.'],
['Available tools', 'The application currently includes image-to-PDF conversion, PDF merging, page organization and PDF page extraction. Features may change or improve over time.'],
['Privacy by design', 'PDF and image processing is performed locally in your browser. The application does not require an account to use its core tools.'],
['Technology', 'The application uses locally bundled PDF libraries, including pdf-lib and PDF.js.'],
['Contact', 'For questions, feedback or support, please contact us using the email address below.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'من نحن',
sections: [
['حول AroundByte PDF', 'AroundByte PDF مجموعة أدوات تعمل عبر المتصفح، صُممت لمساعدة المستخدمين على التعامل مع مستندات PDF والصور من خلال واجهة بسيطة وعملية.'],
['هدفنا', 'نسعى إلى توفير أدوات مفيدة للمستندات سهلة الاستخدام، مع التركيز على الخصوصية وسهولة الوصول وتجربة استخدام واضحة.'],
['الأدوات المتاحة', 'يتضمن التطبيق حالياً تحويل الصور إلى PDF، ودمج ملفات PDF، وتنظيم الصفحات، واستخراج صفحات PDF. وقد تتغير الميزات أو تتحسن بمرور الوقت.'],
['الخصوصية في التصميم', 'تتم معالجة ملفات PDF والصور محلياً داخل متصفحك. ولا يتطلب استخدام الأدوات الأساسية إنشاء حساب.'],
['التقنيات', 'يستخدم التطبيق مكتبات PDF مضمّنة محلياً، ومنها pdf-lib وPDF.js.'],
['التواصل', 'للاستفسارات أو الملاحظات أو طلب المساعدة، يمكنك التواصل معنا عبر البريد الإلكتروني الموضح أدناه.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
},
contact: {
en: {
title: 'Contact Us',
sections: [
['Get in touch', 'We welcome questions, suggestions, bug reports and feedback about AroundByte PDF.'],
['Email support', 'For general questions, technical issues or feedback, email us at the address below. Please describe the issue clearly and include the browser and device you are using when relevant.'],
['Response time', 'We will do our best to review messages and respond when possible. A response is not guaranteed within a specific time.'],
['Important', 'Do not email passwords, payment card details or other sensitive personal information. AroundByte PDF does not need your original PDF or image files to receive general feedback.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'اتصل بنا',
sections: [
['يسعدنا تواصلك', 'نرحب باستفساراتك واقتراحاتك وبلاغات الأخطاء وملاحظاتك حول AroundByte PDF.'],
['الدعم عبر البريد الإلكتروني', 'للاستفسارات العامة أو المشكلات التقنية أو إرسال الملاحظات، راسلنا على البريد الإلكتروني أدناه. يُرجى وصف المشكلة بوضوح وذكر المتصفح والجهاز المستخدم عند الحاجة.'],
['وقت الرد', 'سنبذل جهدنا لمراجعة الرسائل والرد عليها متى أمكن. ولا نضمن الرد خلال مدة زمنية محددة.'],
['ملاحظة مهمة', 'لا ترسل كلمات المرور أو بيانات البطاقات المصرفية أو أي معلومات شخصية حساسة. لا نحتاج إلى ملفات PDF أو الصور الأصلية لاستقبال الملاحظات العامة.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
},
privacy: {
en: {
title: 'Privacy Policy',
sections: [
['Introduction', 'This Privacy Policy explains how AroundByte PDF handles information when you visit or use the application. We aim to collect as little information as reasonably possible.'],
['Files you process', 'The PDF and image tools are designed to process files locally in your browser. Your selected files are not intentionally uploaded to an AroundByte server by these tools. Processing may depend on your browser and device capabilities.'],
['Recent activity', 'If you use the Recent screen, the app stores operation names, file names, file sizes, page counts and timestamps in your browser local IndexedDB storage. It does not store the PDF or image contents. You can clear this history from the Recent screen or clear this site data in your browser.'],
['Information stored on your device', 'The application uses browser local storage to remember preferences such as your selected language and appearance theme. This information remains in your browser storage unless you clear it.'],
['Information from hosting', 'The hosting provider may process standard technical information when you visit the website, such as IP address, request time, browser details and server logs, in accordance with its own policies and operational requirements.'],
['Cookies and similar technologies', 'The application itself currently uses local storage for preferences and does not need advertising cookies to perform its PDF tools. Hosting services or third-party services may use cookies or similar technologies. See our Cookie Policy for more information.'],
['Advertising and third parties', 'Google AdSense advertising is not currently activated in this application. If advertising or other third-party services are introduced, this policy will be updated to explain the relevant data use, cookies, identifiers and choices. Third-party providers operate under their own privacy policies.'],
['Children', 'The application is not specifically directed at children. If you believe a child has provided personal information to a service associated with this website, contact us so the matter can be reviewed.'],
['Your choices', 'You can clear browser site data to remove locally stored preferences. You can also stop using the application at any time. Clearing site data may reset your language and theme settings.'],
['Policy changes', 'We may update this policy when the application or its services change. The latest version will be published on this page with an updated date.'],
['Contact', 'For privacy questions, contact us at the email address provided below.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'سياسة الخصوصية',
sections: [
['مقدمة', 'توضح سياسة الخصوصية هذه كيفية تعامل AroundByte PDF مع المعلومات عند زيارة التطبيق أو استخدامه. ونسعى إلى تقليل جمع المعلومات إلى أدنى حد ممكن.'],
['الملفات التي تعالجها', 'صُممت أدوات PDF والصور لمعالجة الملفات محلياً داخل متصفحك. ولا تقوم هذه الأدوات عمداً برفع الملفات التي تختارها إلى خادم تابع لـ AroundByte. وقد تعتمد المعالجة على إمكانات المتصفح والجهاز.'],
['المعلومات المخزنة على جهازك', 'يستخدم التطبيق التخزين المحلي للمتصفح لتذكر تفضيلات مثل اللغة والمظهر. وتبقى هذه المعلومات في مساحة التخزين الخاصة بمتصفحك ما لم تقم بمسحها.'],
['معلومات الاستضافة', 'قد يعالج مزود الاستضافة معلومات تقنية اعتيادية عند زيارتك للموقع، مثل عنوان IP ووقت الطلب وتفاصيل المتصفح وسجلات الخادم، وفقاً لسياساته ومتطلبات تشغيل الخدمة.'],
['ملفات تعريف الارتباط والتقنيات المشابهة', 'يستخدم التطبيق حالياً التخزين المحلي لتذكر التفضيلات، ولا يحتاج إلى ملفات تعريف ارتباط إعلانية لتشغيل أدوات PDF. وقد تستخدم خدمات الاستضافة أو الخدمات الخارجية ملفات تعريف الارتباط أو تقنيات مشابهة. راجع سياسة ملفات تعريف الارتباط لمزيد من المعلومات.'],
['الإعلانات والخدمات الخارجية', 'إعلانات Google AdSense غير مفعّلة حالياً في هذا التطبيق. إذا تمت إضافة إعلانات أو خدمات خارجية مستقبلاً، فسنحدّث هذه السياسة لتوضيح استخدام البيانات وملفات تعريف الارتباط والمعرّفات والخيارات المتاحة. وتخضع الخدمات الخارجية لسياسات الخصوصية الخاصة بها.'],
['الأطفال', 'التطبيق غير موجّه تحديداً للأطفال. إذا كنت تعتقد أن طفلاً قد قدم معلومات شخصية إلى خدمة مرتبطة بهذا الموقع، فتواصل معنا لمراجعة الأمر.'],
['خياراتك', 'يمكنك مسح بيانات الموقع من المتصفح لإزالة التفضيلات المخزنة محلياً. كما يمكنك التوقف عن استخدام التطبيق في أي وقت. وقد يؤدي مسح البيانات إلى إعادة ضبط اللغة والمظهر.'],
['تحديث السياسة', 'قد نحدّث هذه السياسة عند تغيير التطبيق أو خدماته. وستُنشر النسخة الأحدث في هذه الصفحة مع تحديث تاريخ المراجعة.'],
['التواصل', 'للاستفسارات المتعلقة بالخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني الموضح أدناه.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
},
terms: {
en: {
title: 'Terms of Use',
sections: [
['Acceptance of terms', 'By accessing or using AroundByte PDF, you agree to these Terms of Use. If you do not agree, please do not use the application.'],
['Permitted use', 'You may use the application for lawful personal or business purposes. You are responsible for ensuring that your use complies with applicable laws and that you have the right to process the files you select.'],
['Your files and responsibilities', 'You remain responsible for the documents and images you choose to process, including their content, ownership and permissions. Do not use the application to process unlawful material or violate another person’s rights.'],
['Local processing', 'The tools are designed to process files in your browser. You are responsible for keeping your original files and maintaining suitable backups. The application is not a permanent file storage service.'],
['Availability and changes', 'We may modify, suspend or discontinue features at any time. We do not guarantee uninterrupted availability, compatibility with every device or browser, or error-free operation.'],
['No professional advice', 'The application provides document-processing utilities only. It does not provide legal, financial, medical or other professional advice.'],
['Disclaimer of warranties', 'To the extent permitted by applicable law, the application is provided on an “as is” and “as available” basis without warranties of any kind.'],
['Limitation of liability', 'To the extent permitted by applicable law, AroundByte will not be liable for indirect, incidental or consequential losses arising from the use of, or inability to use, the application. Nothing in these terms excludes liability that cannot legally be excluded.'],
['Changes to these terms', 'We may update these terms from time to time. Continued use after an updated version is published means you accept the revised terms, to the extent permitted by law.'],
['Contact', 'Questions about these terms can be sent to the email address below.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'شروط الاستخدام',
sections: [
['الموافقة على الشروط', 'بدخولك إلى AroundByte PDF أو استخدامه، فإنك توافق على شروط الاستخدام هذه. إذا لم توافق عليها، يُرجى عدم استخدام التطبيق.'],
['الاستخدام المسموح', 'يمكنك استخدام التطبيق لأغراض شخصية أو تجارية مشروعة. وتقع على عاتقك مسؤولية التأكد من توافق استخدامك مع القوانين المعمول بها وامتلاكك الحق في معالجة الملفات التي تختارها.'],
['ملفاتك ومسؤولياتك', 'تظل مسؤولاً عن المستندات والصور التي تختار معالجتها، بما في ذلك محتواها وملكيتها والأذونات المتعلقة بها. لا تستخدم التطبيق لمعالجة مواد غير قانونية أو لانتهاك حقوق الآخرين.'],
['المعالجة المحلية', 'صُممت الأدوات لمعالجة الملفات داخل متصفحك. وتقع على عاتقك مسؤولية الاحتفاظ بنسخ من ملفاتك الأصلية وإنشاء نسخ احتياطية مناسبة. التطبيق ليس خدمة تخزين دائم للملفات.'],
['التوفر والتغييرات', 'يجوز لنا تعديل الميزات أو تعليقها أو إيقافها في أي وقت. ولا نضمن استمرار الخدمة دون انقطاع أو توافقها مع جميع الأجهزة والمتصفحات أو خلوها من الأخطاء.'],
['عدم تقديم استشارات مهنية', 'يوفر التطبيق أدوات لمعالجة المستندات فقط، ولا يقدم استشارات قانونية أو مالية أو طبية أو أي استشارات مهنية أخرى.'],
['إخلاء ضمانات الاستخدام', 'إلى الحد الذي يسمح به القانون المعمول به، يتم توفير التطبيق كما هو وحسب توفره، دون ضمانات من أي نوع.'],
['حدود المسؤولية', 'إلى الحد الذي يسمح به القانون، لا تتحمل AroundByte مسؤولية الخسائر غير المباشرة أو العرضية أو التبعية الناتجة عن استخدام التطبيق أو عدم القدرة على استخدامه. ولا تستثني هذه الشروط أي مسؤولية لا يجوز استثناؤها قانوناً.'],
['تغييرات الشروط', 'قد نحدّث هذه الشروط من وقت لآخر. ويعني استمرارك في الاستخدام بعد نشر النسخة المحدّثة موافقتك على الشروط المعدّلة، بالقدر الذي يسمح به القانون.'],
['التواصل', 'يمكنك إرسال استفساراتك حول هذه الشروط إلى البريد الإلكتروني الموضح أدناه.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
},
cookies: {
en: {
title: 'Cookie Policy',
sections: [
['What are cookies?', 'Cookies are small text files that websites may store in your browser. Similar technologies can store or access information on your device.'],
['How this application stores preferences', 'AroundByte PDF currently uses browser local storage to remember your language and appearance preferences. Local storage is different from browser cookies and is used to keep these settings between visits.'],
['Essential operation', 'The PDF tools do not require advertising cookies to process your files. Your browser may also store cached application resources to help the website load and work offline or more efficiently.'],
['Third-party services', 'The hosting provider or third-party services may use cookies or similar technologies according to their own configurations and policies. Google AdSense is not currently activated in the application. If advertising is introduced, this policy will be updated to explain relevant cookies and available controls.'],
['Managing stored data', 'You can clear cookies and site data through your browser settings. Clearing local site data may reset saved language and appearance preferences and remove cached resources.'],
['Contact', 'If you have questions about this policy, contact us using the email address below.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'سياسة ملفات تعريف الارتباط',
sections: [
['ما ملفات تعريف الارتباط؟', 'ملفات تعريف الارتباط هي ملفات نصية صغيرة قد تخزنها المواقع في متصفحك. وتستطيع تقنيات مشابهة تخزين المعلومات على جهازك أو الوصول إليها.'],
['كيفية حفظ التفضيلات في التطبيق', 'يستخدم AroundByte PDF حالياً التخزين المحلي للمتصفح لتذكر تفضيلات اللغة والمظهر. ويختلف التخزين المحلي عن ملفات تعريف الارتباط، ويُستخدم للاحتفاظ بهذه الإعدادات بين الزيارات.'],
['التشغيل الأساسي', 'لا تحتاج أدوات PDF إلى ملفات تعريف ارتباط إعلانية لمعالجة ملفاتك. وقد يحتفظ متصفحك أيضاً بنسخ مخزنة مؤقتاً من موارد التطبيق للمساعدة في تحميل الموقع وتشغيله دون اتصال أو بكفاءة أكبر.'],
['الخدمات الخارجية', 'قد يستخدم مزود الاستضافة أو الخدمات الخارجية ملفات تعريف الارتباط أو تقنيات مشابهة وفقاً لإعداداتها وسياساتها. إعلانات Google AdSense غير مفعّلة حالياً في التطبيق. وإذا أُضيفت الإعلانات مستقبلاً، فسنحدّث هذه السياسة لتوضيح ملفات تعريف الارتباط ذات الصلة وخيارات التحكم المتاحة.'],
['إدارة البيانات المخزنة', 'يمكنك مسح ملفات تعريف الارتباط وبيانات الموقع من إعدادات المتصفح. وقد يؤدي مسح بيانات الموقع إلى إعادة ضبط تفضيلات اللغة والمظهر وإزالة الموارد المخزنة مؤقتاً.'],
['التواصل', 'إذا كانت لديك أسئلة حول هذه السياسة، فتواصل معنا عبر البريد الإلكتروني الموضح أدناه.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
},
disclaimer: {
en: {
title: 'Disclaimer',
sections: [
['General information', 'AroundByte PDF is provided as a document-processing utility. Information on this website is for general informational purposes and should not be treated as professional advice.'],
['Accuracy and results', 'We work to make the tools useful and reliable, but we cannot guarantee that every file will be processed correctly or that every output will meet a particular requirement. Always review generated documents before relying on them.'],
['Keep your own copies', 'You are responsible for keeping original files and backups. Do not rely on this application as the only copy or permanent storage location for important documents.'],
['Third-party libraries and services', 'The application may rely on third-party software libraries and hosting services. Their availability and operation may be subject to their own terms and policies.'],
['External links', 'Links to external websites are provided for convenience. We do not control and are not responsible for the content, policies or availability of external websites.'],
['Limitation', 'Use the application at your own discretion. To the extent permitted by law, AroundByte disclaims liability for loss resulting from reliance on the application or its output.'],
['Contact', 'For questions about this disclaimer, contact us at the email address below.']
],
updated: 'Last updated: November 1, 2026'
},
ar: {
title: 'إخلاء المسؤولية',
sections: [
['معلومات عامة', 'يُقدَّم AroundByte PDF كأداة لمعالجة المستندات. والمعلومات الموجودة في هذا الموقع لأغراض معلوماتية عامة، ولا ينبغي اعتبارها استشارة مهنية.'],
['الدقة والنتائج', 'نعمل على جعل الأدوات مفيدة وموثوقة، لكننا لا نضمن معالجة كل ملف بصورة صحيحة أو مطابقة كل نتيجة لمتطلبات معينة. راجع دائماً المستندات الناتجة قبل الاعتماد عليها.'],
['الاحتفاظ بنسخك', 'أنت مسؤول عن الاحتفاظ بالملفات الأصلية والنسخ الاحتياطية. لا تعتمد على هذا التطبيق باعتباره النسخة الوحيدة أو مكان التخزين الدائم للمستندات المهمة.'],
['المكتبات والخدمات الخارجية', 'قد يعتمد التطبيق على مكتبات برمجية وخدمات استضافة تابعة لأطراف خارجية. وقد يخضع توفرها وتشغيلها لشروط وسياسات تلك الجهات.'],
['الروابط الخارجية', 'قد نوفر روابط لمواقع خارجية لتسهيل الوصول إليها. ولا نتحكم في محتوى تلك المواقع أو سياساتها أو مدى توفرها، ولسنا مسؤولين عنها.'],
['حدود المسؤولية', 'استخدم التطبيق وفق تقديرك ومسؤوليتك. وإلى الحد الذي يسمح به القانون، تخلي AroundByte مسؤوليتها عن الخسائر الناتجة عن الاعتماد على التطبيق أو مخرجاته.'],
['التواصل', 'للاستفسارات المتعلقة بإخلاء المسؤولية، تواصل معنا عبر البريد الإلكتروني الموضح أدناه.']
],
updated: 'آخر تحديث: 1 نوفمبر 2026'
}
}
};

const id = location.pathname.split('/').pop().replace(/\.html?$/i, '');
const page = pages[id] || pages.about;
let language = localStorage.getItem('abpdf-lang') === 'ar' ? 'ar' : 'en';

const $ = id => document.getElementById(id);

const THEME_KEY = 'abpdf-theme';

function applyLegalTheme() {
  const selected = localStorage.getItem(THEME_KEY) || 'dark';
  const resolved = selected === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : selected;

  document.documentElement.dataset.theme = resolved;
}

applyLegalTheme();

window.addEventListener('storage', event => {
  if (event.key === THEME_KEY) applyLegalTheme();
});

const systemTheme = window.matchMedia('(prefers-color-scheme: light)');
systemTheme.addEventListener?.('change', () => {
  if ((localStorage.getItem(THEME_KEY) || 'dark') === 'system') {
    applyLegalTheme();
  }
});


function render() {
  const data = page[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  $('legalTitle').textContent = data.title;
  $('legalUpdated').textContent = data.updated;
  $('legalBody').replaceChildren();

  data.sections.forEach(([heading, paragraph]) => {
    const section = document.createElement('section');
    section.className = 'legal-section';
    const h2 = document.createElement('h2');
    const p = document.createElement('p');
    h2.textContent = heading;
    p.textContent = paragraph;
    section.append(h2, p);
    $('legalBody').append(section);
  });

  $('legalLang').textContent = language === 'en' ? 'العربية' : 'English';
  $('backLink').textContent = language === 'en' ? 'Back to app' : 'العودة إلى التطبيق';
  $('footerHome').textContent = language === 'en' ? 'AroundByte PDF' : 'AroundByte PDF';
  $('contactPrompt').textContent = language === 'en' ? 'For questions, contact us: ' : 'للاستفسارات، تواصل معنا: ';
  $('legalYear').textContent = new Date().getFullYear();
  document.title = `${data.title} — AroundByte PDF`;
}

$('legalLang').addEventListener('click', () => {
  language = language === 'en' ? 'ar' : 'en';
  localStorage.setItem('abpdf-lang', language);
  render();
});

render();
})();
