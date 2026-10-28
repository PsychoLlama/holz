import { level, type LogLevel, type Log } from '@holz/core';

/**
 * Serializes a log as a single line of JSON (without the trailing newline).
 */
export const serialize = (log: Log): string => {
  // Follow the order of typical log statements. Be kind to human readers.
  return JSON.stringify(
    {
      level: labelForLevel[log.level],
      time: new Date(log.timestamp).toISOString(),
      msg: log.message,
      origin: log.origin,
      ctx: Object.keys(log.context).length > 0 ? log.context : undefined,
    },
    errorSerializer,
  );
};

/**
 * Errors are not JSON serializable, but errors are naturally a crucial aspect
 * of any logging system. This unwraps errors into a JSON representation.
 */
const errorSerializer = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    return {
      ...value, // Some custom errors have important custom properties.
      name: value.name,
      message: value.message,
      cause: value.cause,

      // `AggregateError` collects its constituent failures in a
      // non-enumerable `errors` array that the spread above misses. Pull it
      // explicitly so those underlying errors survive serialization; the
      // replacer recurses into each one.
      ...(value instanceof AggregateError && { errors: value.errors }),
    };
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
