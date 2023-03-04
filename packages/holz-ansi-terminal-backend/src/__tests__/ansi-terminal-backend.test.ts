import { Writable } from 'node:stream';
import { Console } from 'node:console';
import { createLogger } from '@holz/core';
import { createAnsiTerminalBackend } from '../ansi-terminal-backend';

const CURRENT_TIME = new Date('2020-06-15T03:05:07.010Z');

describe('ANSI terminal backend', () => {
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

  // Named "terminal" to avoid conflict with `global.console`.
  function createTerminal() {
    const stdout = createStream();
    const stderr = createStream();
    const terminal = new Console({
      stdout: stdout.stream,
      stderr: stderr.stream,
    });

    return {
      stdout,
      stderr,
      terminal,
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

  it('prints the message to the terminal', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });

    const logger = createLogger(backend);
    logger.info('hello world');

    expect(stderr.getOutput()).toContain('hello world');
  });

  it('includes the log level', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(stderr.getOutput()).toContain('DEBUG');
    expect(stderr.getOutput()).toContain('INFO');
    expect(stderr.getOutput()).toContain('WARN');
    expect(stderr.getOutput()).toContain('ERROR');
  });

  it('includes the log namespace', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend)
      .namespace('my-lib')
      .namespace('MyClass');

    logger.debug('initialized');

    expect(stderr.getOutput()).toContain('my-lib:MyClass');
  });

  it('includes the log context', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend);

    logger.info('creating session', { sessionId: 3109 });

    // Hard to test without replicating the implementation.
    expect(stderr.getOutput()).toContain('sessionId');
    expect(stderr.getOutput()).toContain('3109');
  });

  it('does not include the log context if it is empty', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend);

    logger.warn('activating death ray', {});

    // Hard to test without replicating the implementation.
    expect(stderr.getOutput()).not.toContain('{');
    expect(stderr.getOutput()).not.toContain('}');
  });

  it('indents multiline strings', () => {
    const { terminal, stderr } = createTerminal();
    const backend = createAnsiTerminalBackend({ console: terminal });
    const logger = createLogger(backend);

    logger.info('This is a multiline string.\nIt has two lines.');

    expect(stderr.getOutput()).toContain('This is a multiline string.');
    expect(stderr.getOutput()).toContain('  It has two lines.');
  });
});
