# Testing

## Status
| Area | Status |
|---|---|
| Worker logic in Node (inspect, merge, export, rotate, watermark, numbers, metadata, cover opt-in, compression, signing, AcroForms, redaction, rebuild, DOCX package) | PASS, 29/29 (`npm run test:logic`) |
| Worker manager (completion, errors, cancellation, callbacks, constructor failure) | PASS, 12/12 (`npm run test:worker-manager`) |
| PDF preview lifecycle (URL revocation, render cancellation, late canvas encoding, PDF.js loading abort) | PASS, 4/4 (`npm run test:pdfthumbs-lifecycle`) |
| JavaScript syntax, all source and test files | PASS |
| Browser end-to-end suite | Previously PASS, 111/111 before the latest lifecycle changes; must be rerun against this revision |

The current revision has 45 passing Node tests (29 worker logic, 12 worker manager, 4 PDF thumbnail lifecycle). The 111-test browser result belongs to the preceding revision and is not being presented as verification of the latest lifecycle changes. Do not treat this revision as fully release-verified until the browser suite is rerun.

## Run it
```
npm ci && npx playwright install chromium
node tests/e2e.mjs             # starts the local server if needed; writes tests/out/report.json + screenshots

# Fast local regression checks (no browser required)
npm run test:worker-manager && npm run test:logic && npm run test:pdfthumbs-lifecycle
```
It covers: Image to PDF (A4/A3/Letter, both orientations, fit modes), Merge (order and invalid files), Organize (rotate, drag reorder, delete), Extract (ranges), Rotate PDF, Watermark, Page Numbers, Metadata, Compress PDF, Sign PDF, Redact PDF, PDF to JPG/PNG (ZIP contents), Cancel, 800-page merge responsiveness, all exposed tool routes (including Compress, Sign, Redact and Recent) in English and Arabic across desktop/tablet/mobile, RTL sidebar position, offline operation, zero external requests and uncaught page errors. The 111-test suite passed on the preceding revision; rerun it after the current changes. Manual checks below are still required before release.

## Manual checklist (things automation cannot judge)
1. Open each screenshot in `tests/out/`; check Arabic alignment, icon/arrow direction, spacing, font rendering (Noto Sans Arabic), no clipped text.
2. Image to PDF: cover page is off by default; explicitly enable it to add the optional cover. Open the downloaded PDF in Acrobat/Preview/Chrome; images not distorted; "Fill" crops evenly; no blank pages; Custom size and margins correct; a 30 MB photo and 100 images complete without freezing.
3. Organize/Extract: thumbnails match pages; rotation direction is right; a password-protected PDF shows the password message; a 500-page PDF scrolls smoothly.
4. PDF to JPG/PNG: convert a small PDF, unzip the archive, and open every generated image. Try selected page ranges and all three resolution settings.
5. Watermark: confirm placement, opacity, and Arabic/Latin text rendering. Page numbers: confirm position and numbering sequence. Metadata: inspect the output properties in a PDF reader.
6. Safari/Firefox: drag and drop, file dialogs, downloads and PDF.js rendering.
7. DevTools > Network > Offline after one online visit: reload and use every tool. Application > Service Workers should show `abpdf-v26` active.
8. DevTools > Memory/Performance: run a 400+ page merge and PDF-to-image conversion of a 50-page file; confirm memory returns after closing dialogs and leaving Organize/Extract (thumbnail object URLs are revoked).
9. Keyboard only: Tab reaches every control with a visible focus ring; Enter/Space on drop zones opens the picker; up/down buttons reorder lists.
10. Real phone and tablet: layout, file picker, download behaviour.

11. Compression: verify the tool returns the original when the lossless rewrite is not smaller; do not expect image downsampling in this version.
12. Sign PDF: verify the drawn signature is visible on the selected page; this is an image stamp, not a cryptographic digital signature.

15. Redaction: search the output bytes and extract text from marked pages to confirm marked content is absent; verify unmarked pages remain selectable.
16. Repair: test only with a PDF that PDF.js can partially open; expect image-only pages and no selectable text.

Current browser-test environment note: `npm run test:e2e` was attempted against this revision, but Playwright stopped before launching the suite because its Chromium headless-shell executable is not installed in the environment. The suite has not been counted as passing for this revision.
