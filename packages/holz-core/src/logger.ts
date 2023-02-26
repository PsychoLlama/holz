import type { LogProcessor, LogContext } from './types';
import { LogLevel } from './types';

class Logger {
  /**
   * Create a new logger. The processor is up to you. There are plugins for
   * filtering, formatting, combining multiple processors together, and more.
   *
   * If you wish to use more than one processor, `combine(...)` them first.
   */
  static create(processor: LogProcessor): Logger {
    return new Logger(processor, []);
  }

  private constructor(
    private processor: LogProcessor,
    readonly origin: ReadonlyArray<string>
  ) {
    // Non-enumerable to keep the repls clean.
    Object.defineProperty(this, 'processor', {
      configurable: false,
      enumerable: false,
    });
  }

  /** Extend the logger to attach a class or module name to logs. */
  namespace(owner: string): Logger {
    return new Logger(this.processor, this.origin.concat(owner));
  }

  /** Log a frequent and verbose progress update. */
  debug(message: string, context?: LogContext) {
    this.forwardLog(LogLevel.Debug, message, context);
  }

  /** Log a high-level progress update. */
  info(message: string, context?: LogContext) {
    this.forwardLog(LogLevel.Info, message, context);
  }

  /** Log something concerning. */
  warn(message: string, context?: LogContext) {
    this.forwardLog(LogLevel.Warn, message, context);
  }

  /** Log a critical failure. */
  error(message: string, context?: LogContext) {
    this.forwardLog(LogLevel.Error, message, context);
  }

  private forwardLog(
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ) {
    this.processor({
      message,
      level,
      origin: this.origin,
      context,
    });
  }
}

export const createLogger = Logger.create;
