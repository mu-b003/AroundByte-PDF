importScripts('../../vendor/qpdf/qpdf.js');

self.onmessage = async ({ data }) => {
  try {
    const { input, userPassword, ownerPassword, permissions = {} } = data || {};

    if (!(input instanceof ArrayBuffer) || input.byteLength < 5) {
      throw new Error('Invalid or empty PDF file.');
    }

    if (input.byteLength > 256 * 1024 * 1024) {
      throw new Error('PDF exceeds the 256 MB limit.');
    }

    if (String.fromCharCode(...new Uint8Array(input, 0, 5)) !== '%PDF-') {
      throw new Error('The selected file is not a valid PDF.');
    }

    if (typeof userPassword !== 'string' || !userPassword.length ||
        typeof ownerPassword !== 'string' || !ownerPassword.length) {
      throw new Error('Both passwords are required.');
    }

    if (typeof self.Module !== 'function') {
      throw new Error('QPDF runtime failed to load.');
    }

    const qpdf = await self.Module({
      noInitialRun: true,
      print: () => {},
      printErr: () => {},
      locateFile: path =>
        new URL('../../vendor/qpdf/' + path, self.location.href).href
    });

    qpdf.FS.writeFile('/input.pdf', new Uint8Array(input));

    const exitCode = qpdf.callMain([
      '--encrypt',
      '--user-password=' + userPassword,
      '--owner-password=' + ownerPassword,
      '--bits=256',
      '--print=' + (permissions.print ? 'full' : 'none'),
      '--modify=' + (permissions.modify ? 'all' : 'none'),
      '--extract=' + (permissions.copy ? 'y' : 'n'),
      '--annotate=' + (permissions.modify ? 'y' : 'n'),
      '--assemble=' + (permissions.modify ? 'y' : 'n'),
      '--form=' + (permissions.modify ? 'y' : 'n'),
      '--',
      '/input.pdf',
      '/protected.pdf'
    ]);

    if (exitCode !== 0) {
      throw new Error('QPDF encryption failed.');
    }

    const result = qpdf.FS.readFile('/protected.pdf');

    if (!result || result.length < 5 ||
        String.fromCharCode(...result.subarray(0, 5)) !== '%PDF-') {
      throw new Error('QPDF did not produce a valid PDF.');
    }

    const output = result.buffer.slice(
      result.byteOffset,
      result.byteOffset + result.byteLength
    );

    self.postMessage({ success: true, output }, [output]);
  } catch (error) {
    self.postMessage({
      success: false,
      error: 'Could not protect this PDF. Check that the file is valid and is not locked with another password.'
    });
  }
};
