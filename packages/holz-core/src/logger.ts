import type { LogProcessor, LogContext } from './types';
import { LogLevel } from './types';

class Logger {
  static create(backend: LogProcessor): Logger {
    return new Logger(backend, []);
  }

  private constructor(
    private processor: LogProcessor,
    private origin: ReadonlyArray<string>
  ) {
    // empty
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
    this.processor.processLog({
      message,
      level,
      origin: this.origin,
      context,
    });
  }
}

export const createLogger = Logger.create;
