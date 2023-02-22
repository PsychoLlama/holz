import { format } from 'util';
import { createLogger } from '@holz/core';
import type { MinimalConsole } from '../ansi-terminal-backend';
import AnsiTerminalBackend from '../ansi-terminal-backend';

class MockConsole implements MinimalConsole {
  log(...strings: Array<unknown>) {
    this.stdout(format(...strings));
  }

  error(...strings: Array<unknown>) {
    this.stderr(format(...strings));
  }

  stdout = vi.fn();
  stderr = vi.fn();
}

describe('Terminal backend', () => {
  it('prints the message to the terminal', () => {
    const terminal = new MockConsole();
    const backend = new AnsiTerminalBackend({ console: terminal });

    const logger = createLogger(backend);
    logger.info('hello world');

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('hello world')
    );
  });

  it('includes the log level', () => {
    const terminal = new MockConsole();
    const backend = new AnsiTerminalBackend({ console: terminal });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('debug')
    );

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('info')
    );

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('warn')
    );

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('error')
    );
  });

  it('includes the log namespace', () => {
    const terminal = new MockConsole();
    const backend = new AnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend)
      .namespace('my-lib')
      .namespace('MyClass');

    logger.debug('initialized');

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('my-lib:MyClass')
    );
  });

  it('includes the log context', () => {
    const terminal = new MockConsole();
    const backend = new AnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend);

    logger.info('creating session', { sessionId: 3109 });

    // Hard to test without replicating the implementation.
    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('sessionId')
    );

    expect(terminal.stderr).toHaveBeenCalledWith(
      expect.stringContaining('3109')
    );
  });

  it('does not include the log context if it is empty', () => {
    const terminal = new MockConsole();
    const backend = new AnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend);

    logger.warn('activating death ray', {});

    // Hard to test without replicating the implementation.
    expect(terminal.stderr).not.toHaveBeenCalledWith(
      expect.stringContaining('{')
    );

    expect(terminal.stderr).not.toHaveBeenCalledWith(
      expect.stringContaining('}')
    );
  });
});
