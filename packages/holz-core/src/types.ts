/**
 * A logger is made up of log processors. These processors take structured
 * logs and do something with them. Examples are logging backends (console,
 * file, uploads) and operators (filtering, transforming, aggregating).
 */
export interface LogProcessor {
  /** Do something with a log message. */
  (log: Log): unknown;
}

/** A log message where variables are carried as structured data. */
export interface Log {
  /** The verbatim log message. Should not contain interpolated data. */
  readonly message: string;

  /** Log severity. One of `levels.*`. */
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

export const level = {
  /** A critical failure happened and the program must exit. */
  fatal: 60,

  /** Something failed, but we can keep going. */
  error: 50,

  /** Cause for concern, but we can keep going. */
  warn: 40,

  /** High-level progress updates. */
  info: 30,

  /** Verbose update about events or control flow (usually hidden). */
  debug: 20,

  /** Extremely detailed progress updates (usually hidden). */
  trace: 10,
} as const;

export type LogLevel = (typeof level)[keyof typeof level];

type JsonPrimitive = string | number | boolean | null | undefined;

export interface JsonContext {
  [key: string]: JsonPrimitive | ReadonlyArray<JsonPrimitive>;
}

/**
 * Custom values allowed in log context. These values don't have to be JSON.
 * The most common case is errors, which support richer error tracking in
 * backends that support it.
 *
 * This is part of the public API. Backends may use declaration merging to
 * extend the standard attributes. It's recommended to use symbols as keys for
 * custom features, but not required.
 */
export interface CustomContext {
  /**
   * Error instance associated with the log message. This supports error
   * tracking and shows prominently in visual backends like TTY output.
   */
  error: Error;
}

/**
 * A type narrowing constraint designed for generic constraints. Controls
 * what fields are allowed in `log.context`, sourcing from `CustomContext`
 * first, then falling back to any JSON value.
 */
export type StrictContext<Input> = {
  [Key in keyof Input]: Key extends keyof CustomContext
    ? CustomContext[Key]
    : JsonPrimitive | ReadonlyArray<JsonPrimitive>;
};

/**
 * A more general type expected by logging backends. Supports type narrowing,
 * so if a known field exists, it will be used instead of the generic JSON
 * type.
 */
export type LogContext = Partial<CustomContext> & JsonContext;

/**
 * This is the public API which generates and sends `Log` events through the
 * user-defined processing pipeline.
 */
export interface Logger {
  readonly owner: ReadonlyArray<string>;

  /** Extend the logger to attach a class or module name to logs. */
  namespace: (owner: string) => Logger;

  /**
   * Create a new logger which runs all logs through a middleware function.
   * Useful for adding default context, doing ad-hoc filtering, or
   * registering plugins. Only applies to this logger and its descendants.
   */
  withMiddleware: (middleware: (next: LogProcessor) => LogProcessor) => Logger;

  /** Log a verbose and frequent update. */
  trace: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;

  /** Log a frequent and verbose progress update. */
  debug: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;

  /** Log a high-level progress update. */
  info: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;

  /** Log something concerning. */
  warn: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;

  /** Log a failure. */
  error: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;

  /** Log a catastrophic failure. */
  fatal: <Context extends StrictContext<Context>>(
    message: string,
    context?: Context,
  ) => void;
}
