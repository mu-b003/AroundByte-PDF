# AroundByte PDF (web)
Plain HTML/CSS/ES-module JavaScript. No build step, backend, analytics or CDN. Bundled in `vendor/`: pdf-lib 1.17.1, PDF.js 3.11.174, JSZip 3.10.1.

## Run
`node serve.mjs 8080` (or `python3 -m http.server 8080`) then open http://localhost:8080. Modules, workers and the service worker need http(s), not file://. Deploy by uploading the folder to any static host over HTTPS. When adding or renaming files, update the list in `sw.js` and bump its cache name.

## Features
Home, Image to PDF, Merge PDF, Organize PDF, Extract pages (multi-range), Rotate PDF, Add PDF Watermark, Add Page Numbers, Edit PDF Metadata, PDF to JPG, PDF to PNG, Compress PDF (lossless structural rewrite only), Sign PDF (drawn signature image), Redact PDF (permanent raster redaction of marked pages), Recent activity, Settings, and About. English and Arabic with RTL. SEO landing pages are available for the tools, with sitemap.xml and robots.txt. Hidden ad containers (`[data-ad-slot]`, top and bottom) await AdSense code.

## SEO pages
Static SEO landing pages are provided for the available tools. The legacy `/split-pdf/` page is retained as a transparent landing-page alias for Extract PDF Pages; Split PDF is not a separate application tool.

## Architecture
`js/worker.js` starts `js/workers/task.worker.js` for image encoding, PDF assembly, merging, export, page rotation, watermarking, page numbering, metadata editing, structural compression, signature stamping, form filling, secure page replacement for redaction, raster-based PDF rebuild, and ZIP. Cancel terminates the worker, so work stops immediately. PDF.js renders thumbnails lazily on the main thread (its own worker does the parsing). Results are re-opened and page-counted before download is offered.

## Honest status
See TESTING.md. Current local checks: worker logic 29/29, worker manager 12/12, PDF thumbnail lifecycle 4/4, and JavaScript syntax checks all pass. The browser end-to-end suite previously passed 111/111 before the latest lifecycle hardening; it still needs to be rerun against this exact revision. Manual cross-browser and real-device checks remain part of the release checklist.

## Known limitations
Redaction permanently removes the original page content by replacing marked pages with flattened images; text on those pages is not selectable. Repair rebuilds a raster PDF only when PDF.js can still open the source, and supports up to 10 pages per run. No Web Worker for PDF.js thumbnail canvas rendering. Image to PDF always outputs JPEG pages (capped at 200 DPI). Safari versions without WebP encoding cannot produce WebP. PDF encryption/protection, password removal, OCR for PDF files, and Word-to-PDF conversion are not implemented in this source build. Compression performs only a lossless structural rewrite and returns the original if it is not smaller; it does not downsample images. Form filling supports interactive AcroForm fields, not XFA. Signing embeds a drawn PNG signature image; it is not a certificate-based digital signature. Watermark text is rendered in the browser using Canvas and embedded as a PNG image, supporting Arabic and Latin text.
