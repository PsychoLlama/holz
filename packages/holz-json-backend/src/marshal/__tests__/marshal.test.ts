import { createLogger } from '@holz/core';
import { toJSON, errorToJSON } from '../marshal';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('toJSON', () => {
  const createSink = () => {
    const lines: Array<string> = [];
    const logger = createLogger((log) => {
      lines.push(JSON.stringify(toJSON(log)));
    });

    return { logger, lines };
  };

  /** Errors include stack traces, so compare them as parsed objects. */
  const parseError = (line: string) =>
    (JSON.parse(line) as { context: { error: unknown } }).context.error;

  const stack: unknown = expect.any(String);

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

    expect(parseError(lines[0])).toEqual({
      name: 'RangeError',
      message: 'Testing NDJSON errors',
      stack,
    });
  });

  it('detects and includes error causes', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: new Error('Cause'),
      }),
    });

    expect(parseError(lines[0])).toEqual({
      name: 'Error',
      message: 'Testing NDJSON errors',
      stack,
      cause: { name: 'Error', message: 'Cause', stack },
    });
  });

  it('serializes a cause that is not an error', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', {
        cause: { code: 'EACCES', retryable: false },
      }),
    });

    expect(parseError(lines[0])).toEqual({
      name: 'Error',
      message: 'Testing NDJSON errors',
      stack,
      cause: { code: 'EACCES', retryable: false },
    });
  });

  it('serializes a primitive cause', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new Error('Testing NDJSON errors', { cause: 'plain string' }),
    });

    expect(parseError(lines[0])).toEqual({
      name: 'Error',
      message: 'Testing NDJSON errors',
      stack,
      cause: 'plain string',
    });
  });

  it('unpacks the constituent errors of an AggregateError', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new AggregateError(
        [new Error('First failure'), new TypeError('Second failure')],
        'Everything failed',
      ),
    });

    expect(parseError(lines[0])).toEqual({
      name: 'AggregateError',
      message: 'Everything failed',
      stack,
      errors: [
        { name: 'Error', message: 'First failure', stack },
        { name: 'TypeError', message: 'Second failure', stack },
      ],
    });
  });

  it('detects a cause alongside an AggregateError', () => {
    const { logger, lines } = createSink();

    logger.error('content', {
      error: new AggregateError([new Error('Inner')], 'Outer', {
        cause: new Error('Root cause'),
      }),
    });

    expect(parseError(lines[0])).toEqual({
      name: 'AggregateError',
      message: 'Outer',
      stack,
      cause: { name: 'Error', message: 'Root cause', stack },
      errors: [{ name: 'Error', message: 'Inner', stack }],
    });
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

describe('errorToJSON', () => {
  const stack: unknown = expect.any(String);

  it('includes the stack trace', () => {
    const error = new Error('Testing stack traces');

    expect(errorToJSON(error)).toHaveProperty('stack', error.stack);
  });

  it('returns a plain object', () => {
    const error = new Error('Outer', { cause: new TypeError('Inner') });

    expect(errorToJSON(error)).toEqual({
      name: 'Error',
      message: 'Outer',
      stack,
      cause: { name: 'TypeError', message: 'Inner', stack, cause: undefined },
    });
  });

  it('passes through non-error values in an AggregateError', () => {
    const error = new AggregateError(
      [new Error('Real error'), 'plain string', { code: 'EACCES' }, null],
      'Mixed failures',
    );

    expect(errorToJSON(error)).toEqual({
      name: 'AggregateError',
      message: 'Mixed failures',
      stack,
      errors: [
        { name: 'Error', message: 'Real error', stack },
        'plain string',
        { code: 'EACCES' },
        null,
      ],
    });
  });

  it('passes through a custom `errors` field that is not an array', () => {
    class ValidationError extends Error {
      name = 'ValidationError';
      errors = { email: 'required' };
    }

    expect(errorToJSON(new ValidationError('Invalid input'))).toEqual({
      name: 'ValidationError',
      message: 'Invalid input',
      stack,
      errors: { email: 'required' },
    });
  });

  it('describes each error when `cause` is an array of errors', () => {
    const error = new Error('Outer', {
      cause: [new Error('First cause'), new TypeError('Second cause')],
    });

    expect(errorToJSON(error)).toEqual({
      name: 'Error',
      message: 'Outer',
      stack,
      cause: [
        { name: 'Error', message: 'First cause', stack },
        { name: 'TypeError', message: 'Second cause', stack },
      ],
    });
  });
});
