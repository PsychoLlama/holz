import { level, type LogLevel, type Log, type LogContext } from '@holz/core';

/**
 * Serializes a log as a single JSON line.
 * Keys ordered to make visually skimming a log file easier.
 */
export const serialize = (log: Log): string => {
  return JSON.stringify({
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
    context: normalizeContext(log.context),
  });
};

/**
 * Errors are not JSON serializable, but errors are naturally a crucial aspect
 * of any logging system. Only `context.error` is treated as one (per
 * `CustomContext`); errors anywhere else are left to `JSON.stringify`.
 */
const normalizeContext = (context: LogContext) => ({
  ...context,
  error: describeErrorField(context.error),
});

/** Unwraps an error, its cause chain, and any aggregated errors. */
export const describeError = (error: Error): Record<string, unknown> => ({
  ...error, // Some custom errors have important custom properties.

  name: error.name,
  message: error.message,
  cause: describeErrorField(error.cause),

  // Special case for `AggregateError` which carries a list of errors. Well,
  // we hope they're errors. It's not like JS enforces it.
  errors: describeErrorField((error as AggregateError).errors),
});

const describeErrorField = (value: unknown): unknown => {
  if (value instanceof Error) {
    return describeError(value);
  }

  if (Array.isArray(value)) {
    return value.map(describeErrorField);
  }

  return value;
};

/**
 * Slightly heavier than logging the number, but easier to process
 * programmatically which is somewhat implied by a JSON backend.
 */
const labelForLevel = Object.fromEntries(
  Object.entries(level).map(([key, value]) => [value, key]),
) as Record<LogLevel, string>;
