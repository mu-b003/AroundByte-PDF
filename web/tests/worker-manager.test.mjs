import assert from 'node:assert/strict';

globalThis.localStorage = {
  getItem: () => 'en',
  setItem: () => {}
};

const workers = [];
let constructorError = null;

class FakeWorker {
  constructor(url) {
    if (constructorError) throw constructorError;

    this.url = url;
    this.messages = [];
    this.terminated = false;
    this.terminateCount = 0;
    this.onmessage = null;
    this.onerror = null;
    this.onmessageerror = null;

    workers.push(this);
  }

  postMessage(message) {
    this.messages.push(message);
    if (this.postError) throw this.postError;
  }

  terminate() {
    this.terminated = true;
    this.terminateCount++;
  }

  send(data) {
    this.onmessage?.({ data });
  }

  fail(message = 'simulated worker failure') {
    this.onerror?.({ message });
  }

  messageError() {
    this.onmessageerror?.({});
  }
}

globalThis.Worker = FakeWorker;

const { task } = await import('../js/worker.js');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

function latestWorker() {
  assert.ok(workers.length > 0, 'Worker was not created');
  return workers.at(-1);
}

await test('creates worker and sends operation payload', () => {
  const job = task('inspect', { file: 'sample.pdf' });
  const worker = latestWorker();

  assert.equal(worker.url, 'js/workers/task.worker.js');
  assert.deepEqual(worker.messages, [
    { op: 'inspect', payload: { file: 'sample.pdf' } }
  ]);

  job.cancel();
  return job.promise.catch(error => assert.equal(error, 'cancel'));
});

await test('resolves on done and terminates worker', async () => {
  const job = task('inspect', { file: 'sample.pdf' });
  const worker = latestWorker();
  const result = { pages: 3 };

  worker.send({ type: 'done', result });

  assert.deepEqual(await job.promise, result);
  assert.equal(worker.terminateCount, 1);
  assert.equal(worker.onmessage, null);
  assert.equal(worker.onerror, null);
  assert.equal(worker.onmessageerror, null);
});

await test('rejects worker error messages and terminates', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();
  const error = { code: 'encrypted', name: 'sample.pdf' };

  worker.send({ type: 'error', ...error });

  await assert.rejects(job.promise, value => {
    assert.deepEqual(value, { type: 'error', ...error });
    return true;
  });

  assert.equal(worker.terminateCount, 1);
});

await test('rejects worker runtime errors', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();

  worker.fail('runtime failure');

  await assert.rejects(job.promise, value => {
    assert.deepEqual(value, {
      code: 'fail',
      message: 'runtime failure'
    });
    return true;
  });

  assert.equal(worker.terminateCount, 1);
});

await test('rejects invalid worker messages', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();

  worker.messageError();

  await assert.rejects(job.promise, value => {
    assert.deepEqual(value, {
      code: 'fail',
      message: 'Invalid worker message'
    });
    return true;
  });

  assert.equal(worker.terminateCount, 1);
});

await test('cancel rejects once, terminates, and removes handlers', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();

  job.cancel();

  await assert.rejects(job.promise, value => value === 'cancel');

  job.cancel();

  assert.equal(worker.terminateCount, 1);
  assert.equal(worker.onmessage, null);
  assert.equal(worker.onerror, null);
  assert.equal(worker.onmessageerror, null);
});

await test('cancel after completion does not terminate again', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();

  worker.send({ type: 'done', result: true });
  assert.equal(await job.promise, true);

  job.cancel();

  assert.equal(worker.terminateCount, 1);
});

await test('forwards progress and item callbacks', async () => {
  const progress = [];
  const items = [];

  const job = task('inspect', {}, {
    onProgress: (a, b) => progress.push([a, b]),
    onItem: item => items.push(item)
  });

  const worker = latestWorker();
  const item = { type: 'item', index: 2 };

  worker.send({ type: 'progress', a: 1, b: 4 });
  worker.send(item);
  worker.send({ type: 'done', result: 'ok' });

  assert.equal(await job.promise, 'ok');
  assert.deepEqual(progress, [[1, 4]]);
  assert.deepEqual(items, [item]);
});

await test('callback exceptions reject the task safely', async () => {
  const job = task('inspect', {}, {
    onProgress: () => {
      throw new Error('callback failure');
    }
  });

  const worker = latestWorker();
  worker.send({ type: 'progress', a: 1, b: 2 });

  await assert.rejects(job.promise, value => {
    assert.deepEqual(value, {
      code: 'fail',
      message: 'callback failure'
    });
    return true;
  });

  assert.equal(worker.terminateCount, 1);
});

await test('cancel after task creation rejects and cleans up', async () => {
  const job = task('inspect', {});
  const worker = latestWorker();

  // Verify explicit cancellation of a live worker task.
  job.cancel();
  await assert.rejects(job.promise, value => value === 'cancel');
  assert.equal(worker.terminateCount, 1);
});

await test('handles postMessage throwing during construction', async () => {
  class ThrowingPostWorker extends FakeWorker {
    postMessage() {
      throw new Error('postMessage failure');
    }
  }

  const OriginalWorker = globalThis.Worker;
  globalThis.Worker = ThrowingPostWorker;

  try {
    const job = task('inspect', {});
    await assert.rejects(job.promise, value => {
      assert.deepEqual(value, {
        code: 'fail',
        message: 'postMessage failure'
      });
      return true;
    });

    const worker = latestWorker();
    assert.equal(worker.terminateCount, 1);
    assert.equal(worker.onmessage, null);
    assert.equal(worker.onerror, null);
    assert.equal(worker.onmessageerror, null);
  } finally {
    globalThis.Worker = OriginalWorker;
  }
});

await test('handles Worker constructor throwing as a rejected task', async () => {
  constructorError = new Error('constructor failure');

  try {
    const job = task('inspect', {});
    await assert.rejects(job.promise, value => {
      assert.deepEqual(value, {
        code: 'fail',
        message: 'constructor failure'
      });
      return true;
    });
    job.cancel();
  } finally {
    constructorError = null;
  }
});

console.log(`\nWorker manager tests: ${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
