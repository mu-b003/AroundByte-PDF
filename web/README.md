# AroundByte PDF (web)
Plain HTML/CSS/ES-module JavaScript. No build step, backend, analytics or CDN. Bundled in `vendor/`: pdf-lib 1.17.1, PDF.js 3.11.174, JSZip 3.10.1.

## Run
`node serve.mjs 8080` (or `python3 -m http.server 8080`) then open http://localhost:8080. Modules, workers and the service worker need http(s), not file://. Deploy by uploading the folder to any static host over HTTPS. When adding or renaming files, update the list in `sw.js` and bump its cache name.

## Features
Home, Image to PDF, Merge PDF, Organize PDF, Extract pages (multi-range), Rotate PDF, Add PDF Watermark (Arabic and Latin text), Add Page Numbers, Edit PDF Metadata, PDF to JPG, PDF to PNG, Settings (language, light/dark/system), About. English and Arabic with RTL. SEO landing pages are available for the tools, with sitemap.xml and robots.txt. Hidden ad containers (`[data-ad-slot]`, top and bottom) await AdSense code.

## Added tools and SEO pages
Rotate PDF, text watermark, page numbers, PDF metadata editing, PDF-to-JPG and PDF-to-PNG are available alongside the original four tools. Search landing pages link to the working app routes and are listed in `sitemap.xml`; `robots.txt` points crawlers to the sitemap.

## Architecture
`js/worker.js` starts `js/workers/task.worker.js` for image encoding, PDF assembly, merging, export, page rotation, watermarking, page numbering, metadata editing and ZIP. Cancel terminates the worker, so work stops immediately. PDF.js renders thumbnails lazily on the main thread (its own worker does the parsing). Results are re-opened and page-counted before download is offered.

## Honest status
See TESTING.md. Current local checks: worker logic 17/17, worker manager 12/12, PDF thumbnail lifecycle 4/4, and JavaScript syntax checks all pass. The browser end-to-end suite previously passed 111/111 before the latest lifecycle hardening; it still needs to be rerun against this exact revision. Manual cross-browser and real-device checks remain part of the release checklist.

## Known limitations
No Web Worker for PDF.js thumbnail canvas rendering. Image to PDF always outputs JPEG pages (capped at 200 DPI). Safari versions without WebP encoding cannot produce WebP. PDF encryption/protection and password removal are not implemented. Watermark text is rendered in the browser using Canvas and embedded as a PNG image, supporting Arabic and Latin text. PDF compression is not offered because rasterizing pages would remove selectable text and could reduce quality.
