/**
 * A logger is made up of log processors. These processors take structured
 * logs and do something with them. Examples are logging backends (console,
 * file, uploads) and operators (filtering, transforming, aggregating).
 */
export interface LogProcessor {
  /** Do something with a log message. */
  (log: Log): void;
}

/** A log message where variables are carried as structured data. */
export interface Log {
  /** The verbatim log message. Should not contain interpolated data. */
  readonly message: string;

  /** Log severity. */
  readonly level: LogLevel;

  /**
   * Where the log message originated. Usually starts with a library or app name,
   * followed by something more specific.
   *
   * @example ['logger-library', 'ConsoleBackend']
   */
  readonly origin: ReadonlyArray<string>;

  /**
   * Key-value pairs that provide additional context for the log message. If
   * you're tempted to interpolate data into the message, consider using log
   * context instead.
   *
   * These values must be JSON serializable.
   *
   * Because it's easy to accidentally include unsuitable log context (e.g.
   * redux state, PII) nested objects are not allowed. The restriction doesn't
   * make it impossible, but it makes it harder to miss during code review.
   *
   * @example { userId: 123, reason: 'disconnect' }
   */
  readonly context: LogContext;
}

export enum LogLevel {
  /** A critical failure happened and the program must exit. */
  Fatal = 'fatal',

  /** Something failed, but we can keep going. */
  Error = 'error',

  /** Cause for concern, but we can keep going. */
  Warn = 'warn',

  /** High-level progress updates. */
  Info = 'info',

  /** Verbose update about events or control flow (usually hidden). */
  Debug = 'debug',

  /** Extremely detailed progress updates (usually hidden). */
  Trace = 'trace',
}

export type LogContext = Record<
  string,
  JsonPrimitive | ReadonlyArray<JsonPrimitive>
>;

type JsonPrimitive = string | number | boolean | null | undefined;
