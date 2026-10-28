import { level, type LogLevel, type Log, type LogContext } from '@holz/core';

/**
 * Serializes a log as a single line of JSON (without the trailing newline).
 */
export const serialize = (log: Log): string => {
  // Key order matters for skimming a log file. Filters come first.
  return JSON.stringify({
    level: labelForLevel[log.level],
    timestamp: new Date(log.timestamp).toISOString(),
    message: log.message,
    origin: log.origin,
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
