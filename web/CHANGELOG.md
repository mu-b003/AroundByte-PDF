# Changelog

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
