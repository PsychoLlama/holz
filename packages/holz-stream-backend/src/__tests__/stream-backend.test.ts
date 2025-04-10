import { Writable } from 'node:stream';
import { createLogger } from '@holz/core';
import { createStreamBackend } from '../stream-backend';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('Stream backend', () => {
  function createStream() {
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
  }

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
    const backend = createStreamBackend({ stream });

    const logger = createLogger(backend);
    logger.trace('scream');
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');
    logger.fatal('goodbye');

    expect(getOutput()).toMatchInlineSnapshot(`
      "2020-06-15T12:00:00.000Z TRACE scream
      2020-06-15T12:00:00.000Z DEBUG shout
      2020-06-15T12:00:00.000Z INFO  normal
      2020-06-15T12:00:00.000Z WARN  hmmmm
      2020-06-15T12:00:00.000Z ERROR oh no
      2020-06-15T12:00:00.000Z FATAL goodbye
      "
    `);
  });

  it('includes the log namespace', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend)
      .namespace('my-lib')
      .namespace('MyClass');

    logger.debug('initialized');

    expect(getOutput()).toContain('[my-lib:MyClass]');
  });

  it('does not print the log namespace if it is empty', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.debug('orphan log');

    expect(getOutput()).not.toContain('[]');
  });

  it('includes the log context', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.info('creating session', { sessionId: 3109, enabled: true });

    expect(getOutput()).toContain('sessionId=3109');
    expect(getOutput()).toContain('enabled=true');
  });

  it('includes the timestamp for each log', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.info('traveling through time');

    expect(getOutput()).toContain(CURRENT_TIME.toISOString());
  });

  it('wraps strings in log context with quotes', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.info('creating session', { code: 'ENOBACON' });

    expect(getOutput()).toContain('code="ENOBACON"');
  });

  it('joins arrays in log context', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.info('adding tags', { tags: ['important', 'urgent'] });

    expect(getOutput()).toContain('tags=["important","urgent"]');
  });

  it('indents multi-line log statements', () => {
    const { stream, getOutput } = createStream();
    const backend = createStreamBackend({ stream });
    const logger = createLogger(backend);

    logger.info('multi-line log\r\nwith a second line\nand a third line');

    expect(getOutput()).toMatchInlineSnapshot(`
      "2020-06-15T12:00:00.000Z INFO  multi-line log
                                     with a second line
                                     and a third line
      "
    `);
  });
});
