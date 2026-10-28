import { level, type LogLevel, type Log, type LogContext } from '@holz/core';

/**
 * Serializes a log as a single line of JSON (without the trailing newline).
 */
export const serialize = (log: Log): string => {
  // Follow the order of typical log statements. Be kind to the human
  // reader.
  return JSON.stringify({
    level: labelForLevel[log.level],
    time: new Date(log.timestamp).toISOString(),
    msg: log.message,
    origin: log.origin,
    ctx:
      Object.keys(log.context).length > 0
        ? serializeContext(log.context)
        : undefined,
  });
};

/**
 * Errors are not JSON serializable, but errors are naturally a crucial aspect
 * of any logging system. Only `context.error` is treated as one (per
 * `CustomContext`); errors anywhere else are left to `JSON.stringify`.
 */
const serializeContext = (context: LogContext) => {
  if (context.error instanceof Error) {
    return { ...context, error: serializeError(context.error) };
  }

  return context;
};

/** Unwraps an error, its cause chain, and any aggregated errors. */
const serializeError = (error: Error): Record<string, unknown> => ({
  ...error, // Some custom errors have important custom properties.
  name: error.name,
  message: error.message,
  cause: unwrap(error.cause),

  // `AggregateError` collects its constituent failures in a non-enumerable
  // `errors` array that the spread above misses. Pull it explicitly so those
  // underlying errors survive serialization.
  ...(error instanceof AggregateError && { errors: error.errors.map(unwrap) }),
});

const unwrap = (value: unknown) =>
  value instanceof Error ? serializeError(value) : value;

/**
 * Slightly heavier than logging the number, but easier to process
 * programmatically which is somewhat implied by a JSON backend.
 */
const labelForLevel = Object.fromEntries(
  Object.entries(level).map(([key, value]) => [value, key]),
) as Record<LogLevel, string>;
