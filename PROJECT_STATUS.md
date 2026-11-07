# AroundByte PDF — local build status

This package contains the updated **web project only**. It does not include the separate Flutter/Android project.

## Current application scope

The app currently exposes 16 of the 20 approved PDF tools:

1. Image to PDF
2. Merge PDF
3. Organize PDF
4. Extract PDF Pages
5. Rotate PDF
6. Add PDF Watermark
7. Add Page Numbers
8. Edit PDF Metadata
9. PDF to JPG
10. PDF to PNG
11. Compress PDF — lossless structural rewrite only; returns the original if the result is not smaller.
12. PDF to Word — creates editable DOCX text with page breaks and RTL paragraph metadata; images, tables, columns and exact layout are not preserved.
13. Sign PDF — embeds a drawn signature image; this is not a certificate-based digital signature.
14. Fill PDF Forms — supports interactive AcroForm fields; not XFA.
15. Redact PDF — replaces marked pages with sanitized images; unmarked pages remain vector content. Text on redacted pages is not selectable.
16. Repair PDF — rebuilds up to 10 pages that PDF.js can still render; rebuilt pages are images.

Recent activity is included as an app page, not as an additional PDF tool. The legacy Split PDF SEO page redirects users to Extract PDF Pages and is not a 21st tool.

## Four approved tools not implemented in this package

- **Word to PDF** — a compatible local DOCX renderer is not included. A proper implementation needs independent checks for layout, tables, images, page breaks, searchability and Arabic RTL.
- **Protect PDF** and **Unlock PDF** — the supplied project does not contain a standard PDF AES-256 encryption/decryption engine. pdf-lib alone does not provide this feature; the app does not fake PDF password protection.
- **OCR PDF** — Tesseract.js, its WASM core, and Arabic/English trained data are not bundled. No remote OCR service or CDN has been introduced.

These four tools are intentionally not shown as working tools in the UI.

## Verification

- Worker logic: 29/29 passed.
- Worker manager: 12/12 passed.
- PDF thumbnail lifecycle: 4/4 passed.
- JavaScript syntax checks: passed.
- Service-worker precache audit: 84 entries, 0 missing files.
- `sitemap.xml`: parses successfully.
- DOCX smoke test: generated DOCX opened in LibreOffice and converted to a two-page PDF.
- Browser E2E: attempted, but Playwright Chromium is absent in the build environment. It is not counted as passing.

## Licensing note

`THIRD_PARTY_NOTICES.md` lists the bundled libraries and the license notices included. Font-specific copyright/reserved-name notices still need to be verified against the exact upstream Inter and Noto Sans Arabic font distributions before public redistribution. No QPDF, Tesseract, or DOCX-rendering dependencies were added.

## Run locally

```bash
cd web
node serve.mjs 8080
```

Open `http://localhost:8080`.

For browser tests, install the locked npm dependencies and Playwright Chromium, then run `npm run test:e2e`.
