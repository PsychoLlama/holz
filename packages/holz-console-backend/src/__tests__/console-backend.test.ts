import { format } from 'util';
import { createLogger } from '@holz/core';
import type { MinimalConsole } from '../console-backend';
import { createConsoleBackend } from '../console-backend';

class MockConsole implements MinimalConsole {
  private fmt = (level: string, ...strings: Array<unknown>) => {
    this.print(format(level, ...strings));
  };

  debug = vi.fn(this.fmt);
  info = vi.fn(this.fmt);
  warn = vi.fn(this.fmt);
  error = vi.fn(this.fmt);

  // Approximation of what gets printed.
  print = vi.fn();
}

describe('Console backend', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      now: new Date('2020-01-01T00:00:00.000Z'),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prints messages to the console', () => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });

    const logger = createLogger(backend);
    logger.info('hello world');

    expect(output.print).toHaveBeenCalledWith(
      expect.stringContaining('hello world')
    );
  });

  it('includes the log namespace', () => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });
    const logger = createLogger(backend)
      .namespace('my-lib')
      .namespace('MyClass');

    logger.debug('initialized');

    expect(output.print).toHaveBeenCalledWith(
      expect.stringContaining('my-lib:MyClass')
    );
  });

  it('includes the log context', () => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });
    const logger = createLogger(backend);

    logger.info('creating session', { sessionId: 3109 });

    // Hard to test without replicating the implementation.
    expect(output.print).toHaveBeenCalledWith(
      expect.stringContaining('sessionId')
    );

    expect(output.print).toHaveBeenCalledWith(expect.stringContaining('3109'));
  });

  it('does not include the log context if it is empty', () => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });
    const logger = createLogger(backend);

    logger.warn('activating death ray', {});

    // Hard to test without replicating the implementation.
    expect(output.print).not.toHaveBeenCalledWith(expect.stringContaining('{'));

    expect(output.print).not.toHaveBeenCalledWith(expect.stringContaining('}'));
  });

  it('prints the time since the last log', () => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });
    const logger = createLogger(backend);

    logger.info('first message');
    vi.advanceTimersByTime(1000);
    logger.info('second message');

    expect(output.print).toHaveBeenCalledWith(expect.stringContaining('+1s'));
  });

  // Snapshot the exact output of each log level. This mostly prevents
  // regressions while doing innocent refactors.
  it.each([
    ['debug' as const, 'just spam', ['ns-1', 'ns-2'], 'debug' as const],
    ['info' as const, 'a little info', ['ns-1', 'ns-2'], 'info' as const],
    ['warn' as const, 'a warning', ['ns-1', 'ns-2'], 'warn' as const],
    [
      'error' as const,
      'some error message',
      ['ns-1', 'ns-2'],
      'error' as const,
    ],
  ])('avoids changing %s messages', (method, message, namespace, pipe) => {
    const output = new MockConsole();
    const backend = createConsoleBackend({ console: output });
    const logger = namespace.reduce(
      (logger, ns) => logger.namespace(ns),
      createLogger(backend)
    );

    logger[method](message, { id: 1234 });

    expect(output[pipe].mock.calls[0]).toMatchSnapshot();
  });
});
