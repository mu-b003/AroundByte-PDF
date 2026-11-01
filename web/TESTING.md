# Testing

## Status
| Area | Status |
|---|---|
| Worker logic in Node (inspect, merge, export order/rotation, corrupt/empty/truncated/header-only PDFs, ZIP) | RUN, 10/10 passed (`npm run test:logic`) |
| JavaScript syntax, all files | RUN, OK |
| Everything in a real browser (all tools, RTL/LTR, viewports, offline, IndexedDB persistence, memory, large files, downloads) | NOT RUN by the author. The build environment could not install a browser. |

An automated browser suite is provided in `tests/e2e.mjs`. It was written but never executed, so expect to fix small script issues the first time.

## Run it
```
npm install && npx playwright install chromium
node serve.mjs 8080            # terminal 1
node tests/e2e.mjs             # terminal 2 -> tests/out/report.json + screenshots
```
It covers: Image to PDF (A4/A3/Letter, both orientations, 3 fit modes, output size check), Merge (order, invalid/empty/corrupt files), Organize (rotate, drag reorder, delete, export), Extract (ranges, invalid range), Compressor (JPEG/WebP/PNG, resize, ZIP contents), Cancel, 800-page merge (frame-gap responsiveness and heap growth), 9 pages x 2 languages x 3 viewports (direction, horizontal overflow, screenshots), RTL sidebar position, history after refresh and after browser restart (persistent profile), fully offline operation, zero external requests, and no uncaught page errors.

## Manual checklist (things automation cannot judge)
1. Open each screenshot in `tests/out/`; check Arabic alignment, icon/arrow direction, spacing, font rendering (Noto Sans Arabic), no clipped text.
2. Image to PDF: open the downloaded PDF in Acrobat/Preview/Chrome; images not distorted; "Fill" crops evenly; no blank pages; Custom size and margins correct; a 30 MB photo and 100 images complete without freezing.
3. Organize/Extract: thumbnails match pages; rotation direction is right; a password-protected PDF shows the password message; a 500-page PDF scrolls smoothly.
4. Compressor: a file that does not shrink is flagged "Larger than original" and excluded from the ZIP; transparent PNG to JPEG gets a white background; unzip the ZIP and open every image.
5. Safari/Firefox: WebP output (Safari without WebP encoding shows a clear message), drag and drop, dialogs.
6. DevTools > Network > Offline after one online visit: reload and use every tool. Application > Service Workers shows `abpdf-v3` active.
7. DevTools > Memory/Performance: run a 400+ page merge and several large image batches; confirm memory returns after closing dialogs (object URLs are revoked on close).
8. Keyboard only: Tab reaches every control with a visible focus ring; Enter/Space on drop zones opens the picker; up/down buttons reorder lists.
9. Real phone and tablet: layout, file picker, download behaviour.
