import { createLogger } from '@holz/core';
import { serialize, describeError } from '../serialize';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('serialize', () => {
  const createSink = () => {
    const lines: Array<string> = [];
    const logger = createLogger((log) => {
      lines.push(serialize(log));
    });

    return { logger, lines };
  };

  beforeEach(() => {
    vi.useFakeTimers({
      now: CURRENT_TIME,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes each level by label', () => {
    const { logger, lines } = createSink();

    logger.trace('content');
    logger.debug('content');
    logger.info('content');
    logger.warn('content');
    logger.error('content');
    logger.fatal('content');

    expect(lines).toEqual([
      expect.stringContaining('"level":"trace"'),
      expect.stringContaining('"level":"debug"'),
      expect.stringContaining('"level":"info"'),
      expect.stringContaining('"level":"warn"'),
      expect.stringContaining('"level":"error"'),
      expect.stringContaining('"level":"fatal"'),
    ]);
  });

  it('orders fields like a typical log statement', () => {
    const { logger, lines } = createSink();

    logger.namespace('app').namespace('module').info('hello', {
      reqId: 'abc',
    });

    expect(lines).toEqual([
      '{"level":"info","timestamp":"2020-06-15T12:00:00.000Z","message":"hello","origin":["app","module"],"context":{"reqId":"abc"}}',
    ]);
  });

  it('includes empty context', () => {
    const { logger, lines } = createSink();

    logger.info('content');

    expect(lines).toEqual([expect.stringContaining('"context":{}')]);
  });

  it('escapes newlines and carriage returns', () => {
    const { logger, lines } = createSink();

    logger.debug('sneaky log\nwith newlines\rand carriage returns\r\n');

    expect(lines).toEqual([
      expect.stringContaining(
        'sneaky log\\nwith newlines\\rand carriage returns\\r\\n',
      ),
    ]);
    expect(lines).toEqual([expect.not.stringMatching(/[\r\n]/)]);
  });

  it('pulls structure from errors', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new RangeError('Testing NDJSON errors'),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"RangeError","message":"Testing NDJSON errors"}',
      ),
    ]);
  });

  it('detects and includes error causes', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: new Error('Cause'),
      }),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"Error","message":"Testing NDJSON errors","cause":{"name":"Error","message":"Cause"}}',
      ),
    ]);
  });

  it('serializes a cause that is not an error', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: { code: 'EACCES', retryable: false },
      }),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"Error","message":"Testing NDJSON errors","cause":{"code":"EACCES","retryable":false}}',
      ),
    ]);
  });

  it('serializes a primitive cause', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', { cause: 'plain string' }),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"Error","message":"Testing NDJSON errors","cause":"plain string"}',
      ),
    ]);
  });

  it('unpacks the constituent errors of an AggregateError', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new AggregateError(
        [new Error('First failure'), new TypeError('Second failure')],
        'Everything failed',
      ),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"AggregateError","message":"Everything failed","errors":[{"name":"Error","message":"First failure"},{"name":"TypeError","message":"Second failure"}]}',
      ),
    ]);
  });

  it('detects a cause alongside an AggregateError', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new AggregateError([new Error('Inner')], 'Outer', {
        cause: new Error('Root cause'),
      }),
    });

    expect(lines).toEqual([
      expect.stringContaining(
        '"error":{"name":"AggregateError","message":"Outer","cause":{"name":"Error","message":"Root cause"},"errors":[{"name":"Error","message":"Inner"}]}',
      ),
    ]);
  });

  it('includes any enumerable properties on the object', () => {
    class CustomError extends Error {
      name = 'CustomError';
      status = 418;
    }

    const { logger, lines } = createSink();

    logger.error('content', {
      error: new CustomError('Testing NDJSON errors'),
    });

    expect(lines).toEqual([expect.stringContaining('"status":418')]);
  });

  it('only unwraps the error under `context.error`', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      // @ts-expect-error Intentional test of error value outside `error` key.
      failure: new Error('Not unwrapped'),
      // @ts-expect-error Intentional test of error value outside `error` key.
      nested: { error: new Error('Not unwrapped either') },
    });

    expect(lines).toEqual([
      expect.stringContaining('"context":{"failure":{},"nested":{"error":{}}}'),
    ]);
  });

  it('passes through a non-error value under `context.error`', () => {
    const { logger, lines } = createSink();

    // @ts-expect-error Intentional test of a non-error `error` value.
    logger.error('content', { error: { code: 'EACCES' } });
    // @ts-expect-error Intentional test of a non-error `error` value.
    logger.error('content', { error: 'plain string' });

    expect(lines).toEqual([
      expect.stringContaining('"context":{"error":{"code":"EACCES"}}'),
      expect.stringContaining('"context":{"error":"plain string"}'),
    ]);
  });
});

describe('describeError', () => {
  it('returns a plain object', () => {
    const error = new Error('Outer', { cause: new TypeError('Inner') });

    expect(describeError(error)).toEqual({
      name: 'Error',
      message: 'Outer',
      cause: { name: 'TypeError', message: 'Inner', cause: undefined },
    });
  });
});
