import type { LogProcessor, LogContext } from './types';
import { LogLevel } from './types';

class Logger {
  constructor(
    private processor: LogProcessor,
    readonly owner: ReadonlyArray<string>,
  ) {
    // Non-enumerable to keep the repl clean.
    const hidden = { configurable: false, enumerable: false };
    Object.defineProperties(this, {
      processor: hidden,
      debug: hidden,
      info: hidden,
      warn: hidden,
      error: hidden,
    });
  }

  /** Extend the logger to attach a class or module name to logs. */
  namespace(owner: string): Logger {
    return new Logger(this.processor, this.owner.concat(owner));
  }

  /** Log a verbose and frequent update. */
  trace = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Trace, message, context);
  };

  /** Log a frequent and verbose progress update. */
  debug = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Debug, message, context);
  };

  /** Log a high-level progress update. */
  info = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Info, message, context);
  };

  /** Log something concerning. */
  warn = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Warn, message, context);
  };

  /** Log a failure. */
  error = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Error, message, context);
  };

  /** Log a catastrophic failure. */
  fatal = (message: string, context?: LogContext) => {
    this.forwardLog(LogLevel.Fatal, message, context);
  };

  private forwardLog(
    level: LogLevel,
    message: string,
    context: LogContext = {},
  ) {
    this.processor({
      message,
      level,
      origin: this.owner,
      context,
    });
  }
}

/**
 * Create a new logger. The processor is up to you. There are plugins for
 * filtering, formatting, combining multiple processors together, and more.
 *
 * If you wish to use more than one processor, `combine(...)` them first.
 */
export const createLogger = (processor: LogProcessor): Logger =>
  new Logger(processor, []);

export type { Logger };
