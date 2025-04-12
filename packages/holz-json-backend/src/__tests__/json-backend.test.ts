import { Writable } from 'node:stream';
import { createLogger } from '@holz/core';
import { createJsonBackend } from '../json-backend';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('JSON backend', () => {
  const createStream = () => {
    let output = '';
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        output += String(chunk);
        callback();
      },
    });

    return {
      getOutput: () => output,
      stream,
    };
  };

  beforeEach(() => {
    vi.useFakeTimers({
      now: CURRENT_TIME,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prints the logs to the writable stream', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(getOutput()).toMatchSnapshot();
  });

  it('escapes newlines and carriage returns', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });
    const logger = createLogger(backend);

    logger.debug('sneaky log\nwith newlines\rand carriage returns\r\n');

    expect(getOutput()).toContain(
      'sneaky log\\nwith newlines\\rand carriage returns\\r\\n',
    );
  });

  it('includes log context', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });
    const logger = createLogger(backend);

    logger.debug('hello', { reqId: 'abc' });

    expect(getOutput()).toContain('"reqId":"abc"');
  });

  it('pulls structure from errors', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new RangeError('Testing NDJSON errors'),
    });

    const output = getOutput();
    expect(output).toContain(
      '"error":{"name":"RangeError","message":"Testing NDJSON errors"}',
    );
  });

  it('detects and includes error causes', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: new Error('Cause'),
      }),
    });

    const output = getOutput();
    expect(output).toContain(
      '"error":{"name":"Error","message":"Testing NDJSON errors","cause":{"name":"Error","message":"Cause"}}',
    );
  });

  it('includes any enumerable properties on the object', () => {
    class CustomError extends Error {
      name = 'CustomError';
      status = 418;
    }

    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });
    const logger = createLogger(backend);

    logger.error('content', {
      error: new CustomError('Testing NDJSON errors'),
    });

    const output = getOutput();
    expect(output).toContain('"status":418');
  });
});
