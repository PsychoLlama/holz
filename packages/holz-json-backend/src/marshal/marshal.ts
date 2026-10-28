import { level, type LogLevel, type Log, type LogContext } from '@holz/core';

/**
 * Converts a log to a JSON-serializable object.
 * Keys ordered to make visually skimming a log file easier.
 */
export const toJSON = (log: Log): Record<string, unknown> => {
  return {
    // Convert the numeric level to a label. Lossless, as keys map back to
    // `level`. Improves readability and use with tools like `jq`.
    level: labelForLevel[log.level],

    // Converted purely for human readability. `jq` doesn't have millis-level
    // date precision, so optimizing for tools is somewhat moot.
    timestamp: new Date(log.timestamp).toISOString(),

    // No changes needed here.
    message: log.message,
    origin: log.origin,

    // Everything in context is meant to be JSON-serializable with the
    // exception (heh) of errors. Attempt a naive conversion.
    context: contextToJSON(log.context),
  };
};

/**
 * Best-effort attempt at converting `Error` instances to serializable JSON.
 *
 * These are among the most important logs, but the default behavior produces
 * an empty object.
 *
 * This is NOT a lossless conversion. Values are too dynamic, especially
 * considering custom errors. But it should handle the vast majority.
 */
export const errorToJSON = (error: Error): Record<string, unknown> => ({
  ...error, // Some custom errors have important custom properties.

  name: error.name,
  message: error.message,
  cause: errorFieldToJSON(error.cause),

  // Special case for `AggregateError` which carries a list of errors. Well,
  // we hope they're errors. It's not like JS enforces it.
  errors: errorFieldToJSON((error as AggregateError).errors),

  // Invaluable when needed, but costly in terms of noise.
  stack: error.stack,
});

const errorFieldToJSON = (value: unknown): unknown => {
  // Example: `Error(...).cause`
  if (value instanceof Error) {
    return errorToJSON(value);
  }

  // Example: `AggregateError(...).errors`
  if (Array.isArray(value)) {
    return value.map(errorFieldToJSON);
  }

  // Pass through unremarked.
  return value;
};

/**
 * Types require `context.error` to be an `Error` instance. Everything else is
 * restricted to JSON values.
 *
 * `errorToJSON` is exported as an escape hatch. Internally, we only handle
 * `context.error`. Consumers with more advanced cases have to eject.
 */
const contextToJSON = (context: LogContext) => ({
  ...context,
  error: errorFieldToJSON(context.error),
});

/**
 * Slightly heavier than logging the number, but easier to process
 * programmatically which is somewhat implied by a JSON backend.
 */
const labelForLevel = Object.fromEntries(
  Object.entries(level).map(([key, value]) => [value, key]),
) as Record<LogLevel, string>;
