import {lang} from './i18n.js';

const COPY = {
  en: {
    button: "About the Tool",
    faqTitle: "Frequently asked questions",
    noteTitle: "Important note",
    tools: {
      img2pdf: {
        title: "About Image to PDF",
        intro: "Image to PDF helps you turn photos and scanned images into a PDF document directly in your browser. Add one image or several, arrange their order, choose how each image fits on the page, and create a PDF you can save.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Combine multiple images into one PDF document.",
          "Arrange images in the order you want before conversion.",
          "Choose A4, A3, A5, Letter, Legal, or the original image size.",
          "Choose portrait or landscape orientation where available and adjust page margins.",
          "Choose Contain, Cover, or Actual size image fitting.",
          "Adjust JPEG image quality, set an output filename, and optionally add a cover page."
        ],
        stepsTitle: "How to convert images to PDF",
        steps: [
          "Open Image to PDF and select your images, or drag and drop them into the upload area.",
          "Arrange the images in the order you want them to appear in the PDF.",
          "Choose the page size, orientation, margins, and image fit settings.",
          "Adjust quality if needed, enter an output filename, and decide whether to add a cover page.",
          "Select Create PDF and save the generated document."
        ],
        extraTitle: "Understanding image fit options",
        extra: [
          "Contain: Shows the complete image inside the page area. Empty space may remain around it.",
          "Cover: Fills the available page area. Parts of the image may be cropped if its proportions differ from the page.",
          "Actual size: Uses the image's natural sizing option rather than stretching it to fill the page."
        ],
        faqs: [
          ["Can I put several images into one PDF?", "Yes. Add multiple supported images, arrange their order, and create one PDF document."],
          ["Can I change the order of the pages?", "Yes. Arrange the images before creating the PDF. Their order determines the order of the resulting pages."],
          ["Which page sizes are available?", "You can choose A4, A3, A5, Letter, Legal, or the original image size."],
          ["Are my images uploaded to a server?", "The conversion is performed locally in your browser. Your selected images are processed on your device rather than uploaded to an AroundByte conversion server."],
          ["Why is part of my image missing?", "The Cover option may crop image edges to fill the page. Choose Contain if you want the complete image to remain visible."],
          ["Does image quality affect the PDF?", "The quality setting controls JPEG image quality during processing. A higher setting generally preserves more detail and may produce a larger PDF."]
        ],
        note: "For the best result, use clear images and check their order and page layout before creating the PDF. The final appearance depends on the original image dimensions and the layout options you choose."
      },

      merge: {
        title: "About Merge PDF",
        intro: "Merge PDF combines multiple PDF documents into one file. It is useful when you want to bring related reports, forms, chapters, or other documents together in a single PDF.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Combine two or more PDF files into one document.",
          "Arrange the input files in the order you want before merging.",
          "Choose a filename for the merged PDF.",
          "Review the selected files before starting the operation."
        ],
        stepsTitle: "How to merge PDF files",
        steps: [
          "Open Merge PDF and add the PDF files you want to combine.",
          "Check the file list and rearrange the files into the required order.",
          "Enter a name for the resulting PDF.",
          "Select Merge PDF and save the combined document."
        ],
        faqs: [
          ["Can I merge just one PDF?", "At least two PDF files are required to use the merge operation."],
          ["Can I change the order of the documents?", "Yes. Rearrange the files in the list before merging. Their order determines how the documents are combined."],
          ["Does merging change the original files?", "The tool creates a separate merged output. Keep your original files if you may need them later."]
        ],
        note: "Check the file order before merging. The pages are combined according to the order of the documents in the list."
      },

      organize: {
        title: "About Organize PDF",
        intro: "Organize PDF helps you rearrange, rotate, and remove pages from a PDF document. Use the page thumbnails to review the document and prepare a new version with the page order you need.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "View PDF pages as thumbnails.",
          "Drag pages to change their order.",
          "Select individual pages or use Select All and Select None.",
          "Delete selected pages and rotate individual pages.",
          "Choose a filename for the exported PDF."
        ],
        stepsTitle: "How to organize PDF pages",
        steps: [
          "Upload the PDF you want to organize.",
          "Drag page thumbnails to arrange them in the required order.",
          "Select pages you want to remove, then choose Delete selected.",
          "Use the rotation control on a page when its orientation needs correcting.",
          "Check the remaining pages and select Export PDF."
        ],
        faqs: [
          ["Can I move a page to a different position?", "Yes. Drag its thumbnail to the position where you want it to appear."],
          ["What does Select All do?", "It selects all pages for the page-removal action. It does not create a separate extracted PDF."],
          ["Can I rotate only one page?", "Yes. Use the rotation control on the thumbnail of the page you want to rotate."]
        ],
        note: "The selection controls are used to select pages for deletion. If you want to save selected pages as a separate PDF, use the Extract PDF Pages tool instead. The tool prevents deleting every page from the document."
      },

      extract: {
        title: "About Extract PDF Pages",
        intro: "Extract PDF Pages lets you select specific pages from a PDF and save them as a separate document. You can select pages visually or enter page numbers and ranges.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Select individual pages from the thumbnail view.",
          "Use Select All or Select None to manage the selection.",
          "Enter page numbers and ranges, such as 1-3, 5, 8-10.",
          "Export the selected pages into a new PDF file."
        ],
        stepsTitle: "How to extract PDF pages",
        steps: [
          "Upload the PDF containing the pages you need.",
          "Select pages from the thumbnails or enter page numbers and ranges.",
          "Review the selected pages before exporting.",
          "Enter an output filename and select the export action.",
          "Save the new PDF containing the selected pages."
        ],
        faqs: [
          ["How do I enter a page range?", "You can enter ranges such as 1-3, 5, 8-10. Separate multiple entries with commas, semicolons, or spaces."],
          ["Will the extracted pages follow the order I typed?", "The exported pages follow their original order in the source PDF."],
          ["Does extraction remove pages from my original PDF?", "No. The tool creates a separate PDF containing the selected pages."]
        ],
        note: "Make sure the page numbers and ranges refer to pages that exist in your PDF. The exported document keeps the selected pages in their original document order."
      },

      crop: {
        title: "About Crop PDF",
        intro: "Crop PDF changes the visible page boundaries of a PDF document. Use the preview and crop controls to define the area you want to keep, then export a cropped copy.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Preview the first page of the PDF while setting the crop area.",
          "Adjust the crop boundaries using the on-screen frame.",
          "Enter Left, Top, Right, and Bottom values as percentages.",
          "Apply the same crop boundaries to all pages in the document.",
          "Reset the crop area to the full page."
        ],
        stepsTitle: "How to crop a PDF",
        steps: [
          "Upload the PDF you want to crop.",
          "Use the preview frame to define the area you want to keep.",
          "Adjust the Left, Top, Right, and Bottom values if needed.",
          "Review the crop boundaries and use Reset if you want to start again.",
          "Enter an output filename and export the cropped PDF."
        ],
        faqs: [
          ["Can I crop each page differently?", "The crop settings are applied consistently across all pages. This tool does not provide separate crop settings for individual pages."],
          ["Which page is shown in the preview?", "The preview displays the first page of the PDF."],
          ["Can I restore the original crop area before exporting?", "Yes. Use Reset to return the crop boundaries to the full page."]
        ],
        note: "The preview shows the first page, but the same crop boundaries are applied to every page. Check whether one set of boundaries is suitable for the entire document before exporting."
      },

      rotate: {
        title: "About Rotate PDF",
        intro: "Rotate PDF corrects the orientation of a PDF document by turning its pages in fixed 90-degree steps. It is useful when a document appears sideways or upside down.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Rotate PDF pages by 90, 180, or 270 degrees.",
          "Correct sideways or upside-down page orientation.",
          "Create a rotated copy of the source PDF.",
          "Choose a filename for the resulting document."
        ],
        stepsTitle: "How to rotate a PDF",
        steps: [
          "Upload the PDF you want to rotate.",
          "Choose the rotation angle: 90, 180, or 270 degrees.",
          "Enter a filename for the output document.",
          "Start the rotation and save the resulting PDF."
        ],
        faqs: [
          ["Which rotation angles are available?", "You can choose 90, 180, or 270 degrees."],
          ["Can I rotate a page by an arbitrary angle?", "No. The available rotation choices are fixed 90-degree increments."],
          ["Will the original PDF be replaced?", "The operation produces a separate rotated output file."]
        ],
        note: "Review the resulting document after rotation to make sure the page orientation is correct for your needs."
      },

      watermark: {
        title: "About Add PDF Watermark",
        intro: "Add PDF Watermark places diagonal text across PDF pages. A text watermark can help identify a document as a draft, sample, or copy for a particular purpose.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Enter the text you want to use as a watermark.",
          "Adjust the watermark text size.",
          "Adjust the watermark opacity.",
          "Create a watermarked copy of the PDF."
        ],
        stepsTitle: "How to add a PDF watermark",
        steps: [
          "Upload the PDF you want to mark.",
          "Enter the watermark text.",
          "Choose the text size and opacity.",
          "Start the operation and save the watermarked PDF."
        ],
        faqs: [
          ["Can I use my own watermark text?", "Yes. Enter the text you want displayed as the watermark."],
          ["Can I change the watermark size?", "Yes. Use the available size setting to adjust the text."],
          ["What does opacity control?", "Opacity controls how transparent or visible the watermark appears."]
        ],
        note: "A watermark is a visible document marking. It should not be treated as a security feature or as a substitute for PDF access protection."
      },

      numbers: {
        title: "About Add Page Numbers",
        intro: "Add Page Numbers inserts page numbers into a PDF document. You can set the starting number and adjust the text size before creating a numbered copy.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Add page numbering to a PDF document.",
          "Choose the starting number.",
          "Adjust the page-number text size.",
          "Save the numbered document with a chosen filename."
        ],
        stepsTitle: "How to add page numbers",
        steps: [
          "Upload the PDF you want to number.",
          "Enter the number you want the numbering to start from.",
          "Choose the text size.",
          "Enter an output filename and start the operation.",
          "Review and save the numbered PDF."
        ],
        faqs: [
          ["Can numbering start from a number other than one?", "Yes. Set the starting number using the available start field."],
          ["Can I change the number text size?", "Yes. Adjust the size setting before creating the output."],
          ["Does this tool edit the original file?", "The tool creates a separate numbered PDF."]
        ],
        note: "Check the resulting PDF to confirm that the numbering is suitable for your document before sharing or printing it."
      },

      metadata: {
        title: "About Edit PDF Metadata",
        intro: "Edit PDF Metadata lets you update document information stored in a PDF's properties. This information can help identify and describe a file without editing the visible page content.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Edit the document title and author.",
          "Update the subject and keywords.",
          "Change the creator information.",
          "Export a PDF with the updated metadata."
        ],
        stepsTitle: "How to edit PDF metadata",
        steps: [
          "Upload the PDF whose document information you want to update.",
          "Enter the title, author, subject, keywords, or creator details.",
          "Review the information you entered.",
          "Start the operation and save the updated PDF."
        ],
        faqs: [
          ["Does metadata editing change the text on PDF pages?", "No. These fields update document properties, not the visible text or layout of the pages."],
          ["What are keywords used for?", "Keywords describe the document and can help people identify or search for it."],
          ["Can I leave some fields empty?", "You can update the fields you need. Check the resulting document properties after exporting."]
        ],
        note: "Metadata is separate from the visible contents of a PDF. Review the document properties after exporting to confirm the changes."
      },

      "pdf-to-jpg": {
        title: "About PDF to JPG",
        intro: "PDF to JPG converts PDF pages into JPEG images. You can convert the whole document or specify page numbers and ranges, then download the generated images together in a ZIP file.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Convert all pages or selected pages from a PDF.",
          "Enter page numbers and ranges to choose which pages to convert.",
          "Choose an output scale of 100%, 150%, or 200%.",
          "Download the resulting JPG images in one ZIP archive."
        ],
        stepsTitle: "How to convert PDF to JPG",
        steps: [
          "Upload the PDF you want to convert.",
          "Leave the page-range field empty to convert all pages, or enter the pages and ranges you need.",
          "Choose the output scale.",
          "Enter an output name and start the conversion.",
          "Download the ZIP file containing the JPG images."
        ],
        faqs: [
          ["Can I convert only selected pages?", "Yes. Enter page numbers or ranges in the page-range field. Leave it empty to convert all pages."],
          ["Where are the converted images?", "The generated JPG images are packaged together in a ZIP file."],
          ["Can I choose the image scale?", "Yes. The available choices are 100%, 150%, and 200%."]
        ],
        note: "JPEG uses lossy image compression. It is widely supported and can produce compact images, but some detail may be lost. The tool allows up to 50 pages per conversion."
      },

      "pdf-to-png": {
        title: "About PDF to PNG",
        intro: "PDF to PNG converts PDF pages into PNG images. Choose all pages or specify selected pages and ranges. The resulting images are packaged in a ZIP file for convenient downloading.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Convert all pages or selected pages from a PDF.",
          "Enter page numbers and ranges to choose which pages to convert.",
          "Choose an output scale of 100%, 150%, or 200%.",
          "Download all generated PNG images in one ZIP archive."
        ],
        stepsTitle: "How to convert PDF to PNG",
        steps: [
          "Upload the PDF you want to convert.",
          "Leave the page-range field empty for all pages, or enter specific pages and ranges.",
          "Choose the output scale.",
          "Enter an output name and start the conversion.",
          "Download the ZIP archive containing the PNG images."
        ],
        faqs: [
          ["Can I convert selected pages only?", "Yes. Enter page numbers or ranges. If the field is empty, all pages are converted."],
          ["Why use PNG instead of JPG?", "PNG uses lossless image compression and can be useful for text, diagrams, and graphics. PNG files may be larger than JPEG files."],
          ["How are the images downloaded?", "All generated PNG images are collected into one ZIP file."]
        ],
        note: "PNG can preserve sharp edges and avoid JPEG-style lossy compression, but the resulting files may be larger. The tool allows up to 50 pages per conversion."
      },

      compress: {
        title: "About Compress PDF",
        intro: "Compress PDF reduces the size of a PDF by optimizing its contents, including image data. Choose a compression preset according to whether you prefer a smaller file or higher image quality.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Choose Extreme, Balanced, or High Quality compression.",
          "Reduce PDF size by reprocessing image data.",
          "Set a filename for the compressed output.",
          "Check the result before downloading it."
        ],
        stepsTitle: "How to compress a PDF",
        steps: [
          "Upload the PDF you want to compress.",
          "Choose a preset: Extreme, Balanced, or High Quality.",
          "Enter an output filename.",
          "Start compression and wait while the result is processed and checked.",
          "Save the resulting PDF."
        ],
        faqs: [
          ["Which compression preset should I choose?", "Extreme aims for a smaller file and may reduce image quality. Balanced is the recommended middle option. High Quality prioritizes image quality and may provide smaller size savings."],
          ["Will compression always reduce the file size?", "No. If the processed result is not smaller than the original, the tool keeps the original file."],
          ["What is the maximum supported file size?", "The browser compression workflow has a file-size limit of 256 MB."]
        ],
        note: "Compression involves a trade-off between file size and image quality. The compression engine must load successfully in your browser; if it cannot be loaded, check your connection and try again."
      },

      sign: {
        title: "About Sign PDF",
        intro: "Sign PDF lets you draw a signature and place it into a selected page of a PDF document. It is designed for adding a visual signature image to a document.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Draw a signature using a mouse or touch screen.",
          "Clear the signature and draw it again before applying it.",
          "Choose the PDF page where the signature image will be added.",
          "Set a filename for the signed output."
        ],
        stepsTitle: "How to sign a PDF",
        steps: [
          "Upload the PDF you want to sign.",
          "Draw your signature in the signature area using a mouse or touch screen.",
          "Choose the page number where the signature should be added.",
          "Review your signature and enter an output filename.",
          "Apply the signature and save the resulting PDF."
        ],
        faqs: [
          ["Can I draw with a mouse or my finger?", "Yes. You can use a mouse or a touch screen to draw the signature."],
          ["Can I choose which page receives the signature?", "Yes. Select the page number from the available page field."],
          ["Is this a certificate-based digital signature?", "No. This tool adds a drawn signature image to the selected PDF page. It does not create a certificate-based cryptographic digital signature."]
        ],
        note: "This tool adds a visual signature image, not a certificate-based digital signature. Review the document and make sure this type of signature meets the requirements of the person or organization receiving it."
      },

      redact: {
        title: "About Redact PDF",
        intro: "Redact PDF helps cover selected areas of PDF pages with black boxes. Use the page preview to mark the areas that should be obscured, then export a redacted copy for review.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Preview PDF pages and move between pages.",
          "Draw black boxes over areas you want to obscure.",
          "Undo the most recent redaction or clear the redaction boxes.",
          "Review the number of marked areas before exporting."
        ],
        stepsTitle: "How to redact a PDF",
        steps: [
          "Upload the PDF you want to redact.",
          "Navigate to the page containing information you want to obscure.",
          "Draw black boxes over the relevant areas.",
          "Review the marked pages and correct any mistakes using Undo or Clear Redactions.",
          "Export the redacted PDF and inspect the resulting file carefully."
        ],
        faqs: [
          ["Can I redact more than one page?", "Yes. You can mark multiple pages, subject to the tool's limit of 10 pages containing redaction boxes per operation."],
          ["Is there a PDF page limit?", "The tool supports PDFs up to 200 pages."],
          ["Will text remain selectable on redacted pages?", "Pages with redaction boxes are rendered as images during processing, so their text may no longer be selectable or searchable."],
          ["Does drawing a black box guarantee that all sensitive information is permanently removed?", "Do not assume that a visual cover alone guarantees secure removal. Inspect the exported PDF carefully and verify that sensitive information cannot be recovered before sharing it."]
        ],
        note: "Redaction is a sensitive operation. Carefully inspect the exported PDF before sharing it. Pages that contain redaction boxes are rendered as images, which can affect text selection and search on those pages."
      },

      protect: {
        title: "About Protect PDF",
        intro: "Protect PDF adds password-based encryption to a PDF document. It provides separate user and owner passwords and lets you configure permissions for actions such as printing, copying, and modifying.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Set a user password required to open the protected PDF.",
          "Set a separate owner password for permission settings.",
          "Configure printing, copying, and modification permissions.",
          "Create an encrypted copy of the PDF."
        ],
        stepsTitle: "How to protect a PDF",
        steps: [
          "Upload the PDF you want to protect.",
          "Enter a user password and confirm it.",
          "Enter a different owner password and confirm it.",
          "Choose whether printing, copying, and modifying should be permitted.",
          "Start protection and save the encrypted PDF."
        ],
        faqs: [
          ["What is the user password?", "The user password is used to open the protected PDF."],
          ["What is the owner password?", "The owner password is separate from the user password and controls the document permission settings."],
          ["Can the user and owner passwords be the same?", "No. This tool requires the two passwords to be different."],
          ["Does disabling a permission guarantee that no PDF reader can bypass it?", "PDF permission enforcement can vary between applications. Do not treat permission settings as an absolute guarantee against copying, printing, or modification."]
        ],
        note: "Use strong, unique passwords and store them safely. If you lose the passwords, you may not be able to access or manage the protected document. Password protection and permission settings should not be described as unbreakable security."
      },

      border: {
        title: "About Add PDF Border",
        intro: "Add PDF Border decorates PDF pages with a border. Choose a design preset, customize its color and dimensions, and decide which pages should receive the border.",
        capabilitiesTitle: "What you can do",
        capabilities: [
          "Choose from 12 border design presets.",
          "Select a border color.",
          "Adjust border thickness and inset.",
          "Apply the border to all pages, odd pages, even pages, or a custom page range.",
          "Preview the decoration and choose an output filename."
        ],
        stepsTitle: "How to add a PDF border",
        steps: [
          "Upload the PDF you want to decorate.",
          "Choose a border preset from the available designs.",
          "Select a color and adjust the thickness and inset.",
          "Choose all pages, odd pages, even pages, or enter a custom page range.",
          "Review the preview, enter a filename, and export the PDF."
        ],
        faqs: [
          ["How many border designs are available?", "There are 12 presets, including classic, double, minimal, corner, rounded, dotted, dashed, geometric, art deco, botanical, certificate, and ornate."],
          ["Can I choose the border color?", "Yes. Use the color picker to select the border color."],
          ["Can I apply a border only to selected pages?", "Yes. You can choose odd pages, even pages, or enter a custom page range."]
        ],
        note: "The preview is a sample of the border decoration. Review the exported PDF to confirm that the design and spacing look right on your document's pages."
      }
    }
  },

  ar: {
    button: "حول الأداة",
    faqTitle: "الأسئلة الشائعة",
    noteTitle: "ملاحظة مهمة",
    tools: {
      img2pdf: {
        title: "حول أداة تحويل الصور إلى PDF",
        intro: "تساعدك أداة تحويل الصور إلى PDF على جمع الصور والملفات المصورة في مستند PDF مباشرةً من خلال المتصفح. أضف صورة واحدة أو عدة صور، ورتّبها حسب رغبتك، واختر طريقة ظهورها على الصفحة، ثم أنشئ ملف PDF واحفظه.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "دمج عدة صور في مستند PDF واحد.",
          "ترتيب الصور حسب التسلسل الذي تريده قبل التحويل.",
          "اختيار حجم الصفحة، مثل A4 أو A3 أو A5 أو Letter أو Legal أو الحجم الأصلي للصورة.",
          "اختيار الاتجاه العمودي أو الأفقي عندما يكون متاحاً، وضبط هوامش الصفحة.",
          "تحديد طريقة ملاءمة الصورة للصفحة: الاحتواء أو الملء أو الحجم الفعلي.",
          "ضبط جودة صور JPEG وتحديد اسم ملف PDF الناتج، مع إمكانية إضافة صفحة غلاف اختيارية."
        ],
        stepsTitle: "كيفية تحويل الصور إلى PDF",
        steps: [
          "افتح أداة Image to PDF، ثم اختر الصور أو اسحبها وأفلتها في منطقة رفع الملفات.",
          "رتّب الصور بالتسلسل الذي تريد ظهورها به داخل ملف PDF.",
          "اختر حجم الصفحة والاتجاه والهوامش وطريقة ملاءمة الصور.",
          "اضبط الجودة عند الحاجة، واكتب اسم الملف الناتج، وحدد ما إذا كنت تريد إضافة صفحة غلاف.",
          "اضغط على Create PDF ثم احفظ المستند الناتج."
        ],
        extraTitle: "التعرّف على خيارات ملاءمة الصورة",
        extra: [
          "الاحتواء (Contain): يعرض الصورة كاملة داخل مساحة الصفحة، وقد تظهر مساحة فارغة حولها.",
          "الملء (Cover): يملأ مساحة الصفحة المتاحة، وقد تُقص أجزاء من أطراف الصورة إذا اختلفت أبعادها عن أبعاد الصفحة.",
          "الحجم الفعلي (Actual size): يستخدم خيار التحجيم الطبيعي للصورة بدلاً من تمديدها لملء الصفحة."
        ],
        faqs: [
          ["هل يمكنني وضع عدة صور في ملف PDF واحد؟", "نعم. أضف عدة صور مدعومة، ورتّبها، ثم أنشئ منها مستند PDF واحداً."],
          ["هل يمكنني تغيير ترتيب الصفحات؟", "نعم. رتّب الصور قبل إنشاء الملف، وسيحدد ترتيبها تسلسل الصفحات في مستند PDF الناتج."],
          ["ما أحجام الصفحات المتاحة؟", "يمكنك اختيار A4 أو A3 أو A5 أو Letter أو Legal أو الحجم الأصلي للصورة."],
          ["هل يتم رفع صوري إلى خادم؟", "تتم عملية التحويل محلياً داخل المتصفح. تُعالج الصور التي تختارها على جهازك بدلاً من رفعها إلى خادم تحويل تابع لـ AroundByte."],
          ["لماذا اختفى جزء من الصورة؟", "قد يؤدي خيار Cover إلى قص أطراف الصورة حتى تملأ مساحة الصفحة. اختر Contain إذا كنت تريد إظهار الصورة كاملة."],
          ["هل تؤثر جودة الصورة في ملف PDF؟", "يتحكم إعداد الجودة في جودة صور JPEG أثناء المعالجة. الإعداد الأعلى يحافظ عادةً على تفاصيل أكثر، وقد ينتج عنه ملف PDF أكبر حجماً."]
        ],
        note: "للحصول على نتيجة أفضل، استخدم صوراً واضحة وتحقق من ترتيبها وتخطيط الصفحات قبل إنشاء الملف. يعتمد المظهر النهائي على أبعاد الصور الأصلية وخيارات التخطيط التي تحددها."
      },

      merge: {
        title: "حول أداة دمج ملفات PDF",
        intro: "تتيح لك أداة Merge PDF جمع عدة مستندات PDF في ملف واحد. وهي مفيدة عند رغبتك في جمع التقارير أو النماذج أو الفصول أو المستندات المرتبطة في ملف موحد.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "دمج ملفي PDF أو أكثر في مستند واحد.",
          "ترتيب الملفات حسب التسلسل المطلوب قبل الدمج.",
          "اختيار اسم للملف المدمج.",
          "مراجعة قائمة الملفات المحددة قبل بدء العملية."
        ],
        stepsTitle: "كيفية دمج ملفات PDF",
        steps: [
          "افتح أداة Merge PDF وأضف ملفات PDF التي تريد دمجها.",
          "راجع قائمة الملفات وأعد ترتيبها حسب التسلسل المطلوب.",
          "اكتب اسماً للملف الناتج.",
          "اضغط على Merge PDF ثم احفظ المستند المدمج."
        ],
        faqs: [
          ["هل يمكنني دمج ملف PDF واحد فقط؟", "تتطلب عملية الدمج وجود ملفي PDF على الأقل."],
          ["هل يمكنني تغيير ترتيب المستندات؟", "نعم. أعد ترتيب الملفات في القائمة قبل الدمج، وسيحدد ترتيبها تسلسل المستندات في الناتج."],
          ["هل يؤدي الدمج إلى تغيير الملفات الأصلية؟", "تنشئ الأداة ملفاً مدمجاً منفصلاً. احتفظ بالملفات الأصلية إذا كنت قد تحتاج إليها لاحقاً."]
        ],
        note: "تحقق من ترتيب الملفات قبل الدمج، لأن الصفحات ستُجمع وفقاً لترتيب المستندات في القائمة."
      },

      organize: {
        title: "حول أداة تنظيم صفحات PDF",
        intro: "تساعدك أداة Organize PDF على إعادة ترتيب صفحات مستند PDF وتدويرها وحذف الصفحات التي لا تحتاج إليها. استخدم الصور المصغرة لمراجعة المستند وتجهيز نسخة جديدة بالترتيب المطلوب.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "عرض صفحات PDF على شكل صور مصغرة.",
          "سحب الصفحات لتغيير ترتيبها.",
          "تحديد صفحات منفردة أو استخدام Select All وSelect None.",
          "حذف الصفحات المحددة وتدوير كل صفحة بشكل منفرد.",
          "اختيار اسم لملف PDF الناتج."
        ],
        stepsTitle: "كيفية تنظيم صفحات PDF",
        steps: [
          "ارفع ملف PDF الذي تريد تنظيمه.",
          "اسحب صور الصفحات المصغرة لإعادة ترتيبها.",
          "حدد الصفحات التي تريد حذفها، ثم اختر Delete selected.",
          "استخدم زر التدوير الموجود على بطاقة الصفحة إذا احتجت إلى تصحيح اتجاهها.",
          "راجع الصفحات المتبقية ثم اضغط على Export PDF."
        ],
        faqs: [
          ["هل يمكنني نقل صفحة إلى موضع آخر؟", "نعم. اسحب الصورة المصغرة للصفحة إلى الموضع الذي تريدها أن تظهر فيه."],
          ["ما وظيفة Select All؟", "يحدد جميع الصفحات لاستخدامها في عملية الحذف. ولا ينشئ ملف PDF منفصلاً للصفحات المحددة."],
          ["هل يمكنني تدوير صفحة واحدة فقط؟", "نعم. استخدم زر التدوير الموجود على صورة الصفحة التي تريد تعديل اتجاهها."]
        ],
        note: "تُستخدم أدوات التحديد لاختيار الصفحات المراد حذفها. إذا كنت تريد حفظ صفحات محددة في ملف PDF منفصل، فاستخدم أداة Extract PDF Pages. كما تمنع الأداة حذف جميع صفحات المستند."
      },

      extract: {
        title: "حول أداة استخراج صفحات PDF",
        intro: "تتيح لك أداة Extract PDF Pages اختيار صفحات محددة من ملف PDF وحفظها في مستند منفصل. يمكنك تحديد الصفحات بصرياً أو إدخال أرقام الصفحات والنطاقات.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "اختيار صفحات منفردة من عرض الصور المصغرة.",
          "استخدام Select All أو Select None لإدارة التحديد.",
          "إدخال أرقام الصفحات والنطاقات، مثل 1-3, 5, 8-10.",
          "تصدير الصفحات المحددة إلى ملف PDF جديد."
        ],
        stepsTitle: "كيفية استخراج صفحات PDF",
        steps: [
          "ارفع ملف PDF الذي يحتوي على الصفحات المطلوبة.",
          "حدد الصفحات من الصور المصغرة أو أدخل أرقام الصفحات والنطاقات.",
          "راجع الصفحات المحددة قبل التصدير.",
          "اكتب اسم الملف الناتج ثم ابدأ عملية التصدير.",
          "احفظ ملف PDF الجديد الذي يحتوي على الصفحات المحددة."
        ],
        faqs: [
          ["كيف أدخل نطاقاً من الصفحات؟", "يمكنك إدخال نطاقات مثل 1-3, 5, 8-10. افصل بين الإدخالات باستخدام الفواصل أو الفواصل المنقوطة أو المسافات."],
          ["هل ستظهر الصفحات وفق ترتيب الأرقام التي أدخلتها؟", "يحتفظ الملف الناتج بالترتيب الأصلي للصفحات في المستند المصدر."],
          ["هل يؤدي استخراج الصفحات إلى حذفها من الملف الأصلي؟", "لا. تنشئ الأداة ملف PDF منفصلاً يحتوي على الصفحات التي اخترتها."]
        ],
        note: "تأكد من أن أرقام الصفحات والنطاقات تشير إلى صفحات موجودة في ملفك. يحتفظ المستند الناتج بالترتيب الأصلي للصفحات المحددة."
      },

      crop: {
        title: "حول أداة قص صفحات PDF",
        intro: "تتيح لك أداة Crop PDF تعديل حدود الصفحة الظاهرة في مستند PDF. استخدم المعاينة وأدوات القص لتحديد المساحة التي تريد الاحتفاظ بها، ثم صدّر نسخة مقصوصة من المستند.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "معاينة الصفحة الأولى من ملف PDF أثناء ضبط منطقة القص.",
          "تعديل حدود القص باستخدام الإطار الظاهر على الشاشة.",
          "إدخال قيم اليسار والأعلى واليمين والأسفل بالنسب المئوية.",
          "تطبيق حدود القص نفسها على جميع صفحات المستند.",
          "إعادة ضبط منطقة القص لتشمل الصفحة كاملة."
        ],
        stepsTitle: "كيفية قص ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد قصه.",
          "استخدم إطار المعاينة لتحديد المساحة التي تريد الاحتفاظ بها.",
          "عدّل قيم اليسار والأعلى واليمين والأسفل عند الحاجة.",
          "راجع حدود القص واستخدم Reset إذا أردت البدء من جديد.",
          "اكتب اسم الملف الناتج ثم صدّر ملف PDF المقصوص."
        ],
        faqs: [
          ["هل يمكنني قص كل صفحة بطريقة مختلفة؟", "تُطبق إعدادات القص نفسها على جميع الصفحات. لا توفر هذه الأداة إعدادات قص منفصلة لكل صفحة."],
          ["أي صفحة تظهر في المعاينة؟", "تعرض المعاينة الصفحة الأولى من ملف PDF."],
          ["هل يمكنني استعادة حدود الصفحة الأصلية قبل التصدير؟", "نعم. استخدم Reset لإعادة حدود القص إلى مساحة الصفحة كاملة."]
        ],
        note: "تعرض المعاينة الصفحة الأولى، لكن حدود القص نفسها تُطبق على جميع الصفحات. تأكد من أن الحدود المحددة مناسبة للمستند بأكمله قبل التصدير."
      },

      rotate: {
        title: "حول أداة تدوير PDF",
        intro: "تساعدك أداة Rotate PDF على تصحيح اتجاه مستند PDF من خلال تدوير صفحاته بزوايا ثابتة مقدارها 90 درجة. وهي مفيدة عندما يظهر المستند بشكل جانبي أو مقلوب.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "تدوير صفحات PDF بزاوية 90 أو 180 أو 270 درجة.",
          "تصحيح اتجاه الصفحات الجانبي أو المقلوب.",
          "إنشاء نسخة مدوّرة من ملف PDF الأصلي.",
          "اختيار اسم للملف الناتج."
        ],
        stepsTitle: "كيفية تدوير ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد تدويره.",
          "اختر زاوية التدوير: 90 أو 180 أو 270 درجة.",
          "اكتب اسم الملف الناتج.",
          "ابدأ عملية التدوير ثم احفظ ملف PDF الناتج."
        ],
        faqs: [
          ["ما زوايا التدوير المتاحة؟", "يمكنك اختيار 90 أو 180 أو 270 درجة."],
          ["هل يمكنني التدوير بزاوية عشوائية؟", "لا. تقتصر خيارات التدوير المتاحة على مضاعفات 90 درجة."],
          ["هل سيتم استبدال ملف PDF الأصلي؟", "تنشئ العملية ملفاً مدوّراً منفصلاً."]
        ],
        note: "راجع المستند الناتج بعد التدوير للتأكد من أن اتجاه الصفحات مناسب لاحتياجاتك."
      },

      watermark: {
        title: "حول أداة إضافة علامة مائية إلى PDF",
        intro: "تضيف أداة Add PDF Watermark نصاً مائلاً عبر صفحات PDF. ويمكن استخدام العلامة المائية للتوضيح بأن المستند مسودة أو نسخة تجريبية أو نسخة مخصصة لغرض معين.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "كتابة النص الذي تريد استخدامه كعلامة مائية.",
          "تعديل حجم نص العلامة المائية.",
          "ضبط درجة شفافية العلامة المائية.",
          "إنشاء نسخة من ملف PDF تحمل العلامة المائية."
        ],
        stepsTitle: "كيفية إضافة علامة مائية إلى PDF",
        steps: [
          "ارفع ملف PDF الذي تريد إضافة العلامة إليه.",
          "اكتب نص العلامة المائية.",
          "اختر حجم النص ودرجة الشفافية.",
          "ابدأ العملية ثم احفظ ملف PDF الناتج."
        ],
        faqs: [
          ["هل يمكنني استخدام نص من اختياري؟", "نعم. أدخل النص الذي تريد ظهوره كعلامة مائية."],
          ["هل يمكنني تغيير حجم العلامة المائية؟", "نعم. استخدم إعداد الحجم المتاح لتعديل حجم النص."],
          ["ما وظيفة الشفافية؟", "تتحكم الشفافية في مدى وضوح العلامة المائية أو ظهورها بشكل خافت."]
        ],
        note: "العلامة المائية وسيلة مرئية لتمييز المستند، ولا ينبغي اعتبارها ميزة أمنية أو بديلاً عن حماية ملف PDF بكلمة مرور."
      },

      numbers: {
        title: "حول أداة إضافة أرقام الصفحات",
        intro: "تضيف أداة Add Page Numbers أرقاماً إلى صفحات مستند PDF. يمكنك تحديد رقم البداية وتعديل حجم النص قبل إنشاء نسخة مرقمة من المستند.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "إضافة ترقيم إلى صفحات مستند PDF.",
          "اختيار رقم بداية الترقيم.",
          "تعديل حجم نص أرقام الصفحات.",
          "حفظ المستند المرقم باسم تختاره."
        ],
        stepsTitle: "كيفية إضافة أرقام الصفحات",
        steps: [
          "ارفع ملف PDF الذي تريد ترقيمه.",
          "أدخل الرقم الذي تريد أن يبدأ منه الترقيم.",
          "اختر حجم النص.",
          "اكتب اسم الملف الناتج وابدأ العملية.",
          "راجع ملف PDF المرقم واحفظه."
        ],
        faqs: [
          ["هل يمكن أن يبدأ الترقيم برقم غير واحد؟", "نعم. حدد رقم البداية باستخدام الحقل المخصص لذلك."],
          ["هل يمكنني تغيير حجم أرقام الصفحات؟", "نعم. عدّل إعداد الحجم قبل إنشاء الملف الناتج."],
          ["هل تعدّل الأداة الملف الأصلي؟", "تنشئ الأداة ملف PDF مرقماً منفصلاً."]
        ],
        note: "راجع ملف PDF الناتج للتأكد من أن الترقيم مناسب لمستندك قبل مشاركته أو طباعته."
      },

      metadata: {
        title: "حول أداة تعديل بيانات PDF الوصفية",
        intro: "تتيح لك أداة Edit PDF Metadata تحديث المعلومات المخزنة ضمن خصائص ملف PDF. تساعد هذه المعلومات على تعريف الملف ووصفه دون تعديل المحتوى الظاهر على الصفحات.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "تعديل عنوان المستند واسم المؤلف.",
          "تحديث الموضوع والكلمات المفتاحية.",
          "تغيير معلومات البرنامج أو الجهة المنشئة للمستند.",
          "تصدير ملف PDF يحتوي على البيانات الوصفية المحدّثة."
        ],
        stepsTitle: "كيفية تعديل بيانات PDF الوصفية",
        steps: [
          "ارفع ملف PDF الذي تريد تحديث معلوماته.",
          "أدخل العنوان أو المؤلف أو الموضوع أو الكلمات المفتاحية أو معلومات المنشئ.",
          "راجع المعلومات التي أدخلتها.",
          "ابدأ العملية واحفظ ملف PDF المحدّث."
        ],
        faqs: [
          ["هل يؤدي تعديل البيانات الوصفية إلى تغيير النص الظاهر في الصفحات؟", "لا. تعدّل هذه الحقول خصائص المستند، ولا تغيّر النص الظاهر أو تخطيط الصفحات."],
          ["ما فائدة الكلمات المفتاحية؟", "تساعد الكلمات المفتاحية على وصف المستند وتسهيل التعرف عليه أو البحث عنه."],
          ["هل يمكنني ترك بعض الحقول فارغة؟", "يمكنك تحديث الحقول التي تحتاج إليها. راجع خصائص المستند بعد التصدير للتأكد من التغييرات."]
        ],
        note: "البيانات الوصفية منفصلة عن المحتوى الظاهر في صفحات PDF. راجع خصائص المستند بعد التصدير للتأكد من حفظ التعديلات."
      },

      "pdf-to-jpg": {
        title: "حول أداة تحويل PDF إلى JPG",
        intro: "تحوّل أداة PDF to JPG صفحات ملفات PDF إلى صور JPEG. يمكنك تحويل المستند كاملاً أو تحديد أرقام صفحات ونطاقات معينة، ثم تنزيل الصور الناتجة مجمعة في ملف ZIP.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "تحويل جميع صفحات PDF أو صفحات محددة فقط.",
          "إدخال أرقام الصفحات والنطاقات لاختيار الصفحات المطلوبة.",
          "اختيار مقياس إخراج 100% أو 150% أو 200%.",
          "تنزيل صور JPG الناتجة مجمعة في ملف ZIP واحد."
        ],
        stepsTitle: "كيفية تحويل PDF إلى JPG",
        steps: [
          "ارفع ملف PDF الذي تريد تحويله.",
          "اترك حقل نطاق الصفحات فارغاً لتحويل جميع الصفحات، أو أدخل الصفحات والنطاقات المطلوبة.",
          "اختر مقياس الإخراج.",
          "اكتب اسم الملف الناتج وابدأ التحويل.",
          "نزّل ملف ZIP الذي يحتوي على صور JPG."
        ],
        faqs: [
          ["هل يمكنني تحويل صفحات محددة فقط؟", "نعم. أدخل أرقام الصفحات أو نطاقاتها في الحقل المخصص. اتركه فارغاً لتحويل جميع الصفحات."],
          ["أين أجد الصور بعد التحويل؟", "تُجمع صور JPG الناتجة داخل ملف ZIP واحد."],
          ["هل يمكنني اختيار مقياس الصورة؟", "نعم. الخيارات المتاحة هي 100% و150% و200%."]
        ],
        note: "يستخدم JPEG ضغطاً قد يؤدي إلى فقدان بعض تفاصيل الصورة. يتميز بتوافق واسع وإمكانية إنتاج صور أصغر حجماً. تسمح الأداة بتحويل ما يصل إلى 50 صفحة في العملية الواحدة."
      },

      "pdf-to-png": {
        title: "حول أداة تحويل PDF إلى PNG",
        intro: "تحوّل أداة PDF to PNG صفحات ملفات PDF إلى صور PNG. يمكنك اختيار جميع الصفحات أو تحديد صفحات ونطاقات معينة، ثم تُجمع الصور الناتجة في ملف ZIP لتسهيل تنزيلها.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "تحويل جميع صفحات PDF أو صفحات محددة فقط.",
          "إدخال أرقام الصفحات والنطاقات لاختيار الصفحات المطلوبة.",
          "اختيار مقياس إخراج 100% أو 150% أو 200%.",
          "تنزيل صور PNG الناتجة مجمعة في ملف ZIP واحد."
        ],
        stepsTitle: "كيفية تحويل PDF إلى PNG",
        steps: [
          "ارفع ملف PDF الذي تريد تحويله.",
          "اترك حقل نطاق الصفحات فارغاً لتحويل جميع الصفحات، أو أدخل الصفحات والنطاقات المحددة.",
          "اختر مقياس الإخراج.",
          "اكتب اسم الملف الناتج وابدأ التحويل.",
          "نزّل ملف ZIP الذي يحتوي على صور PNG."
        ],
        faqs: [
          ["هل يمكنني تحويل صفحات محددة فقط؟", "نعم. أدخل أرقام الصفحات أو نطاقاتها. إذا تركت الحقل فارغاً فسيتم تحويل جميع الصفحات."],
          ["لماذا أختار PNG بدلاً من JPG؟", "يستخدم PNG ضغطاً دون فقدان بيانات الصورة، وقد يكون مناسباً للنصوص والرسومات والمخططات. لكن ملفات PNG قد تكون أكبر حجماً من ملفات JPEG."],
          ["كيف يتم تنزيل الصور؟", "تُجمع جميع صور PNG الناتجة داخل ملف ZIP واحد."]
        ],
        note: "يساعد PNG على الحفاظ على الحواف الواضحة وتجنب الضغط الفاقد المستخدم في JPEG، لكن الملفات الناتجة قد تكون أكبر حجماً. تسمح الأداة بتحويل ما يصل إلى 50 صفحة في العملية الواحدة."
      },

      compress: {
        title: "حول أداة ضغط ملفات PDF",
        intro: "تعمل أداة Compress PDF على تقليل حجم ملف PDF من خلال تحسين محتوياته، بما في ذلك بيانات الصور. اختر مستوى الضغط وفقاً لما تفضله بين الحصول على ملف أصغر والحفاظ على جودة الصور.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "الاختيار بين Extreme وBalanced وHigh Quality.",
          "تقليل حجم PDF من خلال إعادة معالجة بيانات الصور.",
          "تحديد اسم الملف المضغوط.",
          "التحقق من النتيجة قبل تنزيلها."
        ],
        stepsTitle: "كيفية ضغط ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد ضغطه.",
          "اختر مستوى الضغط: Extreme أو Balanced أو High Quality.",
          "اكتب اسم الملف الناتج.",
          "ابدأ الضغط وانتظر حتى تتم معالجة النتيجة والتحقق منها.",
          "احفظ ملف PDF الناتج."
        ],
        faqs: [
          ["أي مستوى ضغط ينبغي أن أختار؟", "يهدف Extreme إلى تقليل الحجم بدرجة أكبر وقد يخفض جودة الصور. يوفر Balanced خياراً متوسطاً موصى به. أما High Quality فيعطي الأولوية لجودة الصور وقد يحقق توفيراً أقل في الحجم."],
          ["هل سيؤدي الضغط دائماً إلى تقليل حجم الملف؟", "لا. إذا لم تكن النسخة الناتجة أصغر من الملف الأصلي، تحتفظ الأداة بالملف الأصلي."],
          ["ما الحد الأقصى لحجم الملف؟", "يبلغ الحد الأقصى لحجم الملف في عملية الضغط داخل المتصفح 256 ميجابايت."]
        ],
        note: "تعتمد عملية الضغط على الموازنة بين حجم الملف وجودة الصور. يجب أن يتمكن المتصفح من تحميل محرك الضغط بنجاح؛ وإذا تعذر تحميله فتحقق من اتصالك وحاول مرة أخرى."
      },

      sign: {
        title: "حول أداة توقيع ملفات PDF",
        intro: "تتيح لك أداة Sign PDF رسم توقيع وإضافته إلى صفحة تختارها من مستند PDF. صُممت لإضافة صورة توقيع مرئية إلى المستند.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "رسم التوقيع باستخدام الفأرة أو شاشة اللمس.",
          "مسح التوقيع وإعادة رسمه قبل تطبيقه.",
          "اختيار صفحة PDF التي ستُضاف إليها صورة التوقيع.",
          "تحديد اسم للملف الموقع الناتج."
        ],
        stepsTitle: "كيفية توقيع ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد توقيعه.",
          "ارسم توقيعك في مساحة التوقيع باستخدام الفأرة أو شاشة اللمس.",
          "اختر رقم الصفحة التي تريد إضافة التوقيع إليها.",
          "راجع التوقيع واكتب اسم الملف الناتج.",
          "طبّق التوقيع ثم احفظ ملف PDF الناتج."
        ],
        faqs: [
          ["هل يمكنني الرسم باستخدام الفأرة أو إصبعي؟", "نعم. يمكنك استخدام الفأرة أو شاشة اللمس لرسم التوقيع."],
          ["هل يمكنني اختيار الصفحة التي يوضع عليها التوقيع؟", "نعم. حدد رقم الصفحة من الحقل المخصص لذلك."],
          ["هل هذا توقيع رقمي معتمد بشهادة رقمية؟", "لا. تضيف هذه الأداة صورة توقيع مرسومة إلى صفحة PDF المحددة، ولا تنشئ توقيعاً رقمياً تشفيرياً معتمداً على شهادة رقمية."]
        ],
        note: "تضيف هذه الأداة صورة توقيع مرئية، وليست توقيعاً رقمياً معتمداً على شهادة رقمية. راجع المستند وتأكد من أن هذا النوع من التوقيع يلبي متطلبات الجهة التي ستستلمه."
      },

      redact: {
        title: "حول أداة إخفاء المعلومات من PDF",
        intro: "تساعدك أداة Redact PDF على تغطية مناطق محددة من صفحات PDF بمربعات سوداء. استخدم معاينة الصفحات لتحديد المناطق التي تريد إخفاءها، ثم صدّر نسخة منقحة وراجعها بعناية.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "معاينة صفحات PDF والتنقل بينها.",
          "رسم مربعات سوداء فوق المناطق التي تريد إخفاءها.",
          "التراجع عن آخر تحديد أو مسح مربعات الإخفاء.",
          "مراجعة عدد المناطق المحددة قبل التصدير."
        ],
        stepsTitle: "كيفية إخفاء معلومات من ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد تنقيحه.",
          "انتقل إلى الصفحة التي تحتوي على المعلومات التي تريد إخفاءها.",
          "ارسم مربعات سوداء فوق المناطق المطلوبة.",
          "راجع الصفحات المحددة وصحح الأخطاء باستخدام Undo أو Clear Redactions.",
          "صدّر ملف PDF المنقح وافحص الملف الناتج بعناية."
        ],
        faqs: [
          ["هل يمكنني إخفاء معلومات في أكثر من صفحة؟", "نعم. يمكنك تحديد مناطق في عدة صفحات، مع مراعاة الحد الأقصى البالغ 10 صفحات تحتوي على مربعات إخفاء في العملية الواحدة."],
          ["هل يوجد حد لعدد صفحات ملف PDF؟", "تدعم الأداة ملفات PDF التي يصل عدد صفحاتها إلى 200 صفحة."],
          ["هل سيظل النص قابلاً للتحديد في الصفحات التي تم تنقيحها؟", "تُحوّل الصفحات التي تحتوي على مربعات إخفاء إلى صور أثناء المعالجة، لذلك قد لا يظل نصها قابلاً للتحديد أو البحث."],
          ["هل يضمن رسم مربع أسود إزالة جميع المعلومات الحساسة نهائياً؟", "لا تفترض أن التغطية المرئية وحدها تضمن إزالة المعلومات بشكل آمن. افحص ملف PDF الناتج بعناية وتأكد من عدم إمكانية استعادة المعلومات الحساسة قبل مشاركته."]
        ],
        note: "إخفاء المعلومات عملية حساسة. افحص ملف PDF الناتج بعناية قبل مشاركته. تُحوّل الصفحات التي تحتوي على مربعات إخفاء إلى صور، وقد يؤثر ذلك في إمكانية تحديد النص والبحث فيه داخل تلك الصفحات."
      },

      protect: {
        title: "حول أداة حماية ملفات PDF",
        intro: "تضيف أداة Protect PDF تشفيراً يعتمد على كلمات المرور إلى مستند PDF. وتوفر كلمتي مرور منفصلتين للمستخدم والمالك، كما تتيح ضبط صلاحيات مثل الطباعة والنسخ والتعديل.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "تعيين كلمة مرور للمستخدم تكون مطلوبة لفتح ملف PDF المحمي.",
          "تعيين كلمة مرور مختلفة للمالك للتحكم في إعدادات الصلاحيات.",
          "تحديد صلاحيات الطباعة والنسخ والتعديل.",
          "إنشاء نسخة مشفرة من ملف PDF."
        ],
        stepsTitle: "كيفية حماية ملف PDF",
        steps: [
          "ارفع ملف PDF الذي تريد حمايته.",
          "أدخل كلمة مرور المستخدم وأكدها.",
          "أدخل كلمة مرور مختلفة للمالك وأكدها.",
          "حدد ما إذا كنت تسمح بالطباعة والنسخ والتعديل.",
          "ابدأ عملية الحماية ثم احفظ ملف PDF المشفر."
        ],
        faqs: [
          ["ما كلمة مرور المستخدم؟", "كلمة مرور المستخدم هي كلمة المرور المطلوبة لفتح ملف PDF المحمي."],
          ["ما كلمة مرور المالك؟", "كلمة مرور المالك منفصلة عن كلمة مرور المستخدم، وتتحكم في إعدادات صلاحيات المستند."],
          ["هل يمكن استخدام كلمة المرور نفسها للمستخدم والمالك؟", "لا. تتطلب هذه الأداة أن تكون كلمتا المرور مختلفتين."],
          ["هل يضمن تعطيل إحدى الصلاحيات عدم قدرة أي قارئ PDF على تجاوزها؟", "قد يختلف تطبيق صلاحيات PDF بين البرامج. لذلك لا تعتبر إعدادات الصلاحيات ضماناً مطلقاً لمنع النسخ أو الطباعة أو التعديل."]
        ],
        note: "استخدم كلمات مرور قوية وفريدة واحفظها في مكان آمن. قد لا تتمكن من الوصول إلى المستند المحمي أو إدارته إذا فقدت كلمات المرور. لا ينبغي وصف حماية كلمات المرور والصلاحيات بأنها أمان غير قابل للاختراق."
      },

      border: {
        title: "حول أداة إضافة إطار إلى PDF",
        intro: "تضيف أداة Add PDF Border إطاراً زخرفياً إلى صفحات PDF. اختر تصميماً جاهزاً، وخصص لونه وأبعاده، ثم حدد الصفحات التي تريد تطبيق الإطار عليها.",
        capabilitiesTitle: "ما الذي يمكنك فعله؟",
        capabilities: [
          "الاختيار من بين 12 تصميماً جاهزاً للإطارات.",
          "تحديد لون الإطار.",
          "ضبط سماكة الإطار والمسافة الداخلية.",
          "تطبيق الإطار على جميع الصفحات أو الصفحات الفردية أو الزوجية أو نطاق صفحات مخصص.",
          "معاينة الزخرفة وتحديد اسم الملف الناتج."
        ],
        stepsTitle: "كيفية إضافة إطار إلى PDF",
        steps: [
          "ارفع ملف PDF الذي تريد تزيينه.",
          "اختر أحد تصاميم الإطارات المتاحة.",
          "حدد اللون واضبط السماكة والمسافة الداخلية.",
          "اختر جميع الصفحات أو الفردية أو الزوجية أو أدخل نطاقاً مخصصاً.",
          "راجع المعاينة واكتب اسم الملف ثم صدّر ملف PDF."
        ],
        faqs: [
          ["كم عدد تصاميم الإطارات المتاحة؟", "توجد 12 تصميماً، منها الكلاسيكي والمزدوج والبسيط وإطار الزوايا والمستدير والمنقط والمتقطع والهندسي وآرت ديكو والنباتي وإطار الشهادات والمزخرف."],
          ["هل يمكنني اختيار لون الإطار؟", "نعم. استخدم أداة اختيار اللون لتحديد لون الإطار."],
          ["هل يمكنني تطبيق الإطار على صفحات محددة فقط؟", "نعم. يمكنك اختيار الصفحات الفردية أو الزوجية أو إدخال نطاق صفحات مخصص."]
        ],
        note: "المعاينة تعرض نموذجاً للزخرفة. راجع ملف PDF بعد التصدير للتأكد من أن التصميم والمسافات مناسبان لصفحات مستندك."
      }
    }
  }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function appendToolContent(tool, root) {
  const language = lang() === "ar" ? "ar" : "en";
  const common = COPY[language];
  const content = common.tools[tool.id];

  if (!content) return;

  const articleId = `about-${tool.id}-content`;
  const list = items => items.map(item =>
    `<li>${escapeHtml(item)}</li>`
  ).join("");

  const faqs = content.faqs.map(([question, answer]) => `
    <details class="tool-article-faq">
      <summary>${escapeHtml(question)}</summary>
      <p>${escapeHtml(answer)}</p>
    </details>
  `).join("");

  const extra = content.extra ? `
    <h3>${escapeHtml(content.extraTitle)}</h3>
    <ul>${list(content.extra)}</ul>
  ` : "";

  const section = document.createElement("section");
  section.className = "tool-article";
  section.dir = language === "ar" ? "rtl" : "ltr";

  section.innerHTML = `
    <button
      class="btn ghost tool-article-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="${articleId}">
      <span>${escapeHtml(common.button)}</span>
      <span class="tool-article-chevron" aria-hidden="true">⌄</span>
    </button>

    <div class="tool-article-content" id="${articleId}" hidden>
      <article>
        <h2>${escapeHtml(content.title)}</h2>
        <p class="tool-article-intro">${escapeHtml(content.intro)}</p>

        <h3>${escapeHtml(content.capabilitiesTitle)}</h3>
        <ul>${list(content.capabilities)}</ul>

        <h3>${escapeHtml(content.stepsTitle)}</h3>
        <ol>${list(content.steps)}</ol>

        ${extra}

        <h3>${escapeHtml(common.faqTitle)}</h3>
        <div class="tool-article-faqs">${faqs}</div>

        <div class="tool-article-note">
          <h3>${escapeHtml(common.noteTitle)}</h3>
          <p>${escapeHtml(content.note)}</p>
        </div>
      </article>
    </div>
  `;

  root.append(section);

  const toggle = section.querySelector(".tool-article-toggle");
  const article = section.querySelector(".tool-article-content");

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    article.hidden = isExpanded;
    section.classList.toggle("is-expanded", !isExpanded);
  });
}
