// Client for the bundled Ghostscript 10.08.0 ES-module worker.
// The WASM runtime is loaded only when compression is requested.

export const PRESETS = Object.freeze(['extreme', 'balanced', 'highQuality']);

const MAX_BYTES = 256 * 1024 * 1024;
const WORKER_URL = new URL('./workers/compress.worker.js', import.meta.url);

export function compressWithGhostscript(buffer, preset, onStage) {
  let worker = null;
  let settled = false;
  let rejectPromise;

  const stop = () => {
    if (!worker) return;
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
    worker = null;
  };

  const fail = (code, message) =>
    Object.assign(new Error(message), { code });

  const promise = new Promise((resolve, reject) => {
    rejectPromise = reject;

    if (!(buffer instanceof ArrayBuffer)) {
      reject(fail('INVALID_FILE', 'file must be an ArrayBuffer'));
      return;
    }

    if (buffer.byteLength === 0) {
      reject(fail('EMPTY_FILE', 'The selected file is empty.'));
      return;
    }

    if (buffer.byteLength > MAX_BYTES) {
      reject(fail('FILE_TOO_LARGE', 'file exceeds 256 MB'));
      return;
    }

    const header = new Uint8Array(buffer, 0, Math.min(5, buffer.byteLength));
    if (String.fromCharCode(...header) !== '%PDF-') {
      reject(fail('INVALID_PDF', 'missing %PDF- header'));
      return;
    }

    if (!PRESETS.includes(preset)) {
      reject(fail('INVALID_PRESET', 'unknown preset'));
      return;
    }

    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      stop();
      fn(value);
    };

    try {
      worker = new Worker(WORKER_URL, { type: 'module' });
    } catch (error) {
      done(reject, fail('WORKER_START', error?.message || String(error)));
      return;
    }

    const id = `gs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

    worker.onmessage = ({ data: message }) => {
      if (message.id !== id) return;

      if (message.type === 'progress') {
        onStage?.(message.stage);
        return;
      }

      if (message.type === 'result') {
        if (message.success) {
          done(resolve, {
            bytes: new Uint8Array(message.bytes),
            originalSize: message.originalSize,
            compressedSize: message.compressedSize
          });
        } else {
          done(reject, fail(
            message.code || 'GHOSTSCRIPT_ERROR',
            message.error || 'Ghostscript compression failed.'
          ));
        }
      }
    };

    worker.onerror = (event) => {
      done(reject, fail(
        'WORKER_CRASH',
        event.message || 'Ghostscript worker failed to load.'
      ));
    };

    worker.onmessageerror = () => {
      done(reject, fail('WORKER_ERROR', 'Invalid worker message.'));
    };

    worker.postMessage({
      type: 'compress',
      id,
      file: buffer,
      options: { preset }
    }, [buffer]);
  });

  return {
    promise,
    cancel() {
      if (settled) return;
      settled = true;
      stop();
      rejectPromise('cancel');
    }
  };
}
