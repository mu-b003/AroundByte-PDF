# AroundByte PDF (web)
Plain HTML/CSS/ES-module JavaScript. No build step, backend, analytics or CDN. Bundled in `vendor/`: pdf-lib 1.17.1, PDF.js 3.11.174, JSZip 3.10.1.

## Run
`node serve.mjs 8080` (or `python3 -m http.server 8080`) then open http://localhost:8080. Modules, workers and the service worker need http(s), not file://. Deploy by uploading the folder to any static host over HTTPS. When adding or renaming files, update the list in `sw.js` and bump its cache name.

## Features
Home, Image to PDF, Merge PDF, Organize PDF, Extract pages (multi-range), Image compressor (JPEG/PNG/WebP, resize, size comparison, per-file and ZIP download; files that do not shrink are flagged and excluded from the ZIP), Recent files (IndexedDB, metadata only), Settings (language, light/dark/system), About. English and Arabic with full RTL. Hidden ad containers (`[data-ad-slot]`, top and bottom) await AdSense code.

## Architecture
`js/worker.js` starts `js/workers/task.worker.js` for image encoding, PDF assembly, merging, export and ZIP. Cancel terminates the worker, so work stops immediately. PDF.js renders thumbnails lazily on the main thread (its own worker does the parsing). Results are re-opened and page-counted before download is offered.

## Honest status
See TESTING.md. Worker logic passed 10/10 in a simulated Node environment. The browser suite, RTL/viewport checks, offline mode, history persistence, memory and large-file tests have NOT been run; no browser was available to the author. Treat the app as untested in browsers until `tests/e2e.mjs` and the manual checklist pass.

## Known limitations
No Web Worker for PDF.js thumbnail canvas rendering. Image to PDF always outputs JPEG pages (capped at 200 DPI). Safari versions without WebP encoding cannot produce WebP.
