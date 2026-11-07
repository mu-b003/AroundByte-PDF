import { loadGhostscript, runGhostscript } from '../../vendor/ghostscript/ghostscript.mjs';

const PRESETS = {
  extreme: [
    '-dPDFSETTINGS=/screen',
    '-dColorImageResolution=60',
    '-dGrayImageResolution=60',
    '-dMonoImageResolution=150',
    '-dColorImageDownsampleType=/Bicubic',
    '-dGrayImageDownsampleType=/Bicubic',
    '-dMonoImageDownsampleType=/Subsample',
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    '-dAutoFilterColorImages=true',
    '-dAutoFilterGrayImages=true',
    '-dColorImageFilter=/DCTEncode',
    '-dGrayImageFilter=/DCTEncode',
    '-dEncodeColorImages=true',
    '-dEncodeGrayImages=true',
    '-dEncodeMonoImages=true',
    '-dJPEGQ=35',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dCompressPages=true',
    '-dCompressFonts=true'
  ],
  balanced: [
    '-dPDFSETTINGS=/ebook',
    '-dColorImageResolution=110',
    '-dGrayImageResolution=110',
    '-dMonoImageResolution=300',
    '-dColorImageDownsampleType=/Bicubic',
    '-dGrayImageDownsampleType=/Bicubic',
    '-dMonoImageDownsampleType=/Subsample',
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    '-dAutoFilterColorImages=true',
    '-dAutoFilterGrayImages=true',
    '-dEncodeColorImages=true',
    '-dEncodeGrayImages=true',
    '-dEncodeMonoImages=true',
    '-dJPEGQ=75',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dCompressPages=true',
    '-dCompressFonts=true'
  ],
  highQuality: [
    '-dPDFSETTINGS=/printer',
    '-dColorImageResolution=300',
    '-dGrayImageResolution=300',
    '-dMonoImageResolution=600',
    '-dColorImageDownsampleType=/Bicubic',
    '-dGrayImageDownsampleType=/Bicubic',
    '-dMonoImageDownsampleType=/Subsample',
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    '-dAutoFilterColorImages=true',
    '-dAutoFilterGrayImages=true',
    '-dEncodeColorImages=true',
    '-dEncodeGrayImages=true',
    '-dEncodeMonoImages=true',
    '-dJPEGQ=92',
    '-dEmbedAllFonts=true',
    '-dSubsetFonts=true',
    '-dCompressPages=true',
    '-dCompressFonts=true'
  ]
};

self.onmessage = async ({ data: m }) => {
  if (m?.type !== 'compress') return;

  const { id, file, options = {} } = m;
  const send = (type, extra = {}, transfer = []) =>
    self.postMessage({ type, id, ...extra }, transfer);
  const progress = (stage) => send('progress', { stage });

  try {
    if (!(file instanceof ArrayBuffer) || file.byteLength === 0) {
      throw Object.assign(new Error('Invalid or empty PDF file.'), { code: 'INVALID_FILE' });
    }
    if (!PRESETS[options.preset]) {
      throw Object.assign(new Error('Unknown compression preset.'), { code: 'INVALID_PRESET' });
    }

    const header = new Uint8Array(file, 0, Math.min(5, file.byteLength));
    if (String.fromCharCode(...header) !== '%PDF-') {
      throw Object.assign(new Error('The selected file is not a valid PDF.'), { code: 'INVALID_PDF' });
    }

    progress('loading');
    await loadGhostscript();

    progress('initializing');
    const input = new Uint8Array(file);

    progress('writing-input');
    progress('processing');

    const result = await runGhostscript([
      '-dSAFER',
      '-dBATCH',
      '-dNOPAUSE',
      '-dNOPROMPT',
      '-dQUIET',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.7',
      '-sOutputFile=output.pdf',
      ...PRESETS[options.preset],
      'input.pdf'
    ], {
      files: { 'input.pdf': input }
    });

    if (result.exitCode !== 0) {
      throw Object.assign(
        new Error(result.stderr || `Ghostscript exited with code ${result.exitCode}.`),
        { code: 'GHOSTSCRIPT_ERROR' }
      );
    }

    progress('reading-output');
    const output = result.files['output.pdf'];

    if (!(output instanceof Uint8Array) || output.length < 5 ||
        String.fromCharCode(...output.subarray(0, 5)) !== '%PDF-') {
      throw Object.assign(new Error('Ghostscript did not produce a valid PDF.'), {
        code: 'INVALID_OUTPUT'
      });
    }

    const bytes = output.slice();
    progress('complete');

    send('result', {
      success: true,
      bytes: bytes.buffer,
      originalSize: file.byteLength,
      compressedSize: bytes.byteLength
    }, [bytes.buffer]);
  } catch (error) {
    send('result', {
      success: false,
      code: error?.code || 'GHOSTSCRIPT_ERROR',
      error: error?.message || String(error)
    });
  }
};
