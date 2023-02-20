import { createLogger, LogLevel } from '@holz/core';
import type { MinimalConsole } from '../console-backend';
import ConsoleBackend from '../console-backend';
import { format } from 'util';

class MockConsole implements MinimalConsole {
  log = vi.fn((...strings: Array<unknown>) => {
    this.stdout(format(...strings));
  });

  warn = vi.fn((...strings: Array<unknown>) => {
    this.stdout(format(...strings));
  });

  error = vi.fn((...strings: Array<unknown>) => {
    this.stderr(format(...strings));
  });

  stdout = vi.fn();
  stderr = vi.fn();
}

describe('Console backend', () => {
  it('prints messages to the console', () => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });

    const logger = createLogger(backend);
    logger.info('hello world');

    expect(output.stdout).toHaveBeenCalledWith(
      expect.stringContaining('hello world')
    );
  });

  it('includes the log level', () => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(output.stdout).toHaveBeenCalledWith(
      expect.stringContaining('DEBUG')
    );

    expect(output.stdout).toHaveBeenCalledWith(expect.stringContaining('INFO'));
    expect(output.stdout).toHaveBeenCalledWith(expect.stringContaining('WARN'));
    expect(output.stderr).toHaveBeenCalledWith(
      expect.stringContaining('ERROR')
    );
  });

  it('includes the log namespace', () => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });
    const logger = createLogger(backend)
      .namespace('my-lib')
      .namespace('MyClass');

    logger.debug('initialized');

    expect(output.stdout).toHaveBeenCalledWith(
      expect.stringContaining('my-lib:MyClass')
    );
  });

  it('includes the log context', () => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });
    const logger = createLogger(backend);

    logger.info('creating session', { sessionId: 3109 });

    // Hard to test without replicating the implementation.
    expect(output.stdout).toHaveBeenCalledWith(
      expect.stringContaining('sessionId')
    );

    expect(output.stdout).toHaveBeenCalledWith(expect.stringContaining('3109'));
  });

  it('does not include the log context if it is empty', () => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });
    const logger = createLogger(backend);

    logger.warn('activating death ray', {});

    // Hard to test without replicating the implementation.
    expect(output.stdout).not.toHaveBeenCalledWith(
      expect.stringContaining('{')
    );

    expect(output.stdout).not.toHaveBeenCalledWith(
      expect.stringContaining('}')
    );
  });

  // Snapshot the exact output of each log level. This mostly prevents
  // regressions while doing innocent refactors.
  it.each([
    ['debug' as const, 'just spam', ['ns-1', 'ns-2'], 'log' as const],
    ['info' as const, 'a little info', ['ns-1', 'ns-2'], 'log' as const],
    ['warn' as const, 'a warning', ['ns-1', 'ns-2'], 'warn' as const],
    [
      'error' as const,
      'some error message',
      ['ns-1', 'ns-2'],
      'error' as const,
    ],
  ])('avoids changing %s messages', (method, message, namespace, pipe) => {
    const output = new MockConsole();
    const backend = new ConsoleBackend({ console: output });
    const logger = namespace.reduce(
      (logger, ns) => logger.namespace(ns),
      createLogger(backend)
    );

    logger[method](message, { id: 1234 });

    expect(output[pipe].mock.calls[0]).toMatchSnapshot();
  });
});
