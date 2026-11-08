# Changelog

## 2026-11-08
- Removed Fill PDF Forms and Repair PDF from the current web release, including their dedicated worker operations, pages, assets and tests.
- Removed Image to Text from the current web release because recognition quality was not reliable enough. Its OCR engine and tool-specific assets are no longer bundled. The feature may be reconsidered in a future release.

## 2026-11-06
- Hardened PDF.js document loading with abort support and stale-load protection.
- Made Organize and Extract dispose thumbnail observers, render tasks and object URLs; preserve loaded document state during language changes.
- Added route-exit cleanup and stale-operation guards to Image to PDF, Merge, PDF-to-JPG/PNG and advanced PDF tools.
- Made the image editor close and release its canvases when its tool is exited.
- Made Worker construction failures reject through the task promise consistently; added lifecycle regression tests.
- Added JSZip and all current PNG tool-card assets to the offline precache; bumped the service-worker cache to `abpdf-v23`.
- Added 4 PDF thumbnail lifecycle tests. Current Node test results: 33 passed, 0 failed. Browser E2E must be rerun for this revision.

## 2026-11-05
- Preserved the existing Image to PDF, Merge PDF, Organize PDF and Extract PDF pages tools.
- Added Rotate PDF (90°, 180° and 270°).
- Added text watermarking using a standard Latin PDF font.
- Added page numbering.
- Added PDF metadata editing (title, author, subject, keywords and creator).
- Added PDF-to-JPG and PDF-to-PNG conversion with ZIP downloads and page-range selection.
- Added static SEO landing pages for all supported tools, plus `sitemap.xml` and `robots.txt`.
- Fixed the missing ZIP operation in the worker and added worker-level tests.
- Updated the service worker cache version and precache list.

## Deferred
- PDF encryption/protection and password removal require a dedicated encryption-capable engine; they are not advertised as working.
- Lossless/general-purpose PDF compression is not included. Rasterizing every page would remove selectable text and may reduce quality.


## 2026-11-07 — Local hardening and tool additions

- Image to PDF no longer inserts an AroundByte cover page automatically. The cover is optional and disabled by default.
- Recent activity is now registered in the app navigation and completed operations record metadata locally in IndexedDB.
- Restored the project's `.gitignore`.
- Expanded the zero-dependency development server MIME map for MJS, XML, SVG, JPEG, PDF, WASM, and text files.
- Converted six large tool-card PNG files to WebP and updated the app and service-worker references.
- Updated the service-worker cache version to `abpdf-v25`.
- Updated the browser E2E runner to start the local server when it is not already running.
- Added a third-party notice file documenting which license texts are present and which still need upstream verification before redistribution.

Verification in this build environment: logic tests 29/29, worker-manager tests 12/12, PDF thumbnail lifecycle tests 4/4, and JavaScript syntax checks passed. Browser E2E could not be run because the Playwright Chromium executable is not installed in this environment.

- Added local Compress PDF (lossless rewrite with a strict no-larger-than-original guard), Sign PDF (signature image stamping), and Fill PDF Forms (AcroForm text/check/dropdown/radio fields).
- Added regression tests for these worker operations.

- Added PDF to Word text extraction with editable DOCX output, Arabic RTL paragraph metadata, and page breaks.
- Added permanent redaction by replacing only marked pages with sanitized raster pages; unmarked pages remain vector content.
- Added a limited PDF rebuild tool that reconstructs up to 10 pages that PDF.js can still render; rebuilt pages are images.

- Replaced the planned PDF to Word tool with Image to Text using local Arabic and English OCR. PDF to Word is not part of this release.
