import { createLogger } from '@holz/core';
import { createJsonBackend } from '../json-backend';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('JSON backend', () => {
  const createStream = () => {
    let output = '';
    const closed = Promise.withResolvers<void>();
    const decoder = new TextDecoder();
    const controller = new AbortController();

    const stream = new WritableStream<Uint8Array>(
      {
        write(chunk) {
          output += decoder.decode(chunk);
        },
        close() {
          closed.resolve();
        },
      },
      // A generous queue mirrors the buffering of real file streams, so the
      // backend's backpressure guard doesn't drop a synchronous burst of logs.
      new CountQueuingStrategy({ highWaterMark: 1024 }),
    );

    // Aborting tells the backend to close the writer. Once the queued writes
    // drain, the sink's `close` fires and the captured output is final.
    const getOutput = async () => {
      controller.abort();
      await closed.promise;
      return output;
    };

    return { stream, signal: controller.signal, getOutput };
  };

  beforeEach(() => {
    vi.useFakeTimers({ now: CURRENT_TIME });
  });

  it('prints the logs to the writable stream', async () => {
    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(await getOutput()).toMatchSnapshot();
  });

  it('drops logs when the sink applies backpressure', async () => {
    let output = '';
    const wrote = Promise.withResolvers<void>();
    const decoder = new TextDecoder();

    // A write that never settles keeps the stream saturated, so `desiredSize`
    // stays exhausted and the backend drops rather than buffers.
    const stalled = new Promise<void>(() => {});
    const stream = new WritableStream<Uint8Array>({
      write(chunk) {
        output += decoder.decode(chunk);
        wrote.resolve();
        return stalled;
      },
    });
    const logger = createLogger(createJsonBackend({ stream }));

    for (let i = 0; i < 100; i += 1) {
      logger.info('overwhelming the sink');
    }

    await wrote.promise;
    const lineCount = output.split('\n').filter(Boolean).length;
    expect(lineCount).toBeGreaterThan(0);
    expect(lineCount).toBeLessThan(100);
  });

  it('escapes newlines and carriage returns', async () => {
    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });
    const logger = createLogger(backend);

    logger.debug('sneaky log\nwith newlines\rand carriage returns\r\n');

    expect(await getOutput()).toContain(
      'sneaky log\\nwith newlines\\rand carriage returns\\r\\n',
    );
  });

  it('includes log context', async () => {
    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });
    const logger = createLogger(backend);

    logger.debug('hello', { reqId: 'abc' });

    expect(await getOutput()).toContain('"reqId":"abc"');
  });

  it('pulls structure from errors', async () => {
    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new RangeError('Testing NDJSON errors'),
    });

    expect(await getOutput()).toContain(
      '"error":{"name":"RangeError","message":"Testing NDJSON errors"}',
    );
  });

  it('detects and includes error causes', async () => {
    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: new Error('Cause'),
      }),
    });

    expect(await getOutput()).toContain(
      '"error":{"name":"Error","message":"Testing NDJSON errors","cause":{"name":"Error","message":"Cause"}}',
    );
  });

  it('includes any enumerable properties on the object', async () => {
    class CustomError extends Error {
      name = 'CustomError';
      status = 418;
    }

    const { stream, signal, getOutput } = createStream();
    const backend = createJsonBackend({ stream, signal });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new CustomError('Testing NDJSON errors'),
    });

    expect(await getOutput()).toContain('"status":418');
  });
});
