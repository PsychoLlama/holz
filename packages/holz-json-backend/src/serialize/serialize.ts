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

    // Everything in context is meant to be JSON-serializable, with the
    // exception (heh) of errors. Those are kinda important. We make
    // a best-effort attempt at converting `context.error` to
    // a JSON-serializable value.
    //
    // This is NOT a lossless conversion. Values are too dynamic. But we can
    // handle the vast majority.
    context: contextToJSON(log.context),
  };
};

/** Unwraps an error, its cause chain, and any aggregated errors. */
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
 * Errors are not JSON serializable, but errors are naturally a crucial aspect
 * of any logging system. Only `context.error` is treated as one (per
 * `CustomContext`); errors anywhere else are left to `JSON.stringify`.
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
