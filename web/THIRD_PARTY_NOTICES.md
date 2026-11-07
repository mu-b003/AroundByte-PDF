# Third-party notices

This file records the third-party components visible in the supplied AroundByte PDF source archive. It is not a substitute for upstream license texts.

| Component | Bundled artifact | License status in this source archive | Release action |
|---|---|---|---|
| pdf-lib | `vendor/pdf-lib.min.js` | MIT; `vendor/pdf-lib.LICENSE.md` is present | Retain the bundled license notice. |
| PDF.js | `vendor/pdf.min.js`, `vendor/pdf.worker.min.js` | Mozilla PDF.js; Apache-2.0; the Apache license text is now included as `vendor/pdfjs.LICENSE.md` | Preserve Mozilla copyright and source notices in the bundled file; verify the exact bundled version before public redistribution. |
| JSZip | `vendor/jszip.min.js` | Upstream JSZip is distributed under MIT (also offered under GPL-3.0-or-later); MIT option selected from the upstream dual MIT/GPLv3 licensing; `vendor/jszip.LICENSE.md` is included | Review upstream third-party notices for the exact bundled compression components and verify the bundled release before redistribution. |
| Inter | `assets/fonts/Inter-*.ttf` | Font family is published under SIL Open Font License 1.1; OFL 1.1; `assets/fonts/OFL-1.1.txt` is included | Add the exact upstream copyright and reserved-name notices for the bundled font files; verify their versions. |
| Noto Sans Arabic | `assets/fonts/NotoSansArabic-*.ttf` | Font family is published under SIL Open Font License 1.1; OFL 1.1; `assets/fonts/OFL-1.1.txt` is included | Add the exact upstream copyright and reserved-name notices for the bundled font files; verify their versions. |

## Verification boundary

The archive contains no QPDF, Tesseract.js, Tesseract WASM, `docx`, or `docx-preview` binaries. They are not part of the current dependency set. Their licenses and distribution obligations must be re-audited if they are added later. The exact versions of the existing vendored PDF.js, JSZip, Inter, and Noto Sans Arabic artifacts could not be independently established from the supplied archive alone. Do not treat a version number in an external audit as verified package provenance.
