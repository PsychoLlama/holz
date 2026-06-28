import type { Writable } from 'node:stream';
import { level, type LogLevel, type Log, type LogProcessor } from '@holz/core';

/**
 * Prints structured logs to a writable stream in NDJSON form. Optimized for
 * log files.
 *
 * @example
 * createJsonBackend({
 *   stream: fs.createWriteStream('my-app.log', { flags: 'a' }),
 * })
 *
 * @see https://github.com/ndjson/ndjson-spec
 */
export const createJsonBackend = ({ stream }: Config): LogProcessor => {
  return (log: Log) => {
    // Follow the order of typical log statements. Be kind to the human
    // reader.
    const output = JSON.stringify(
      {
        level: labelForLevel[log.level],
        time: new Date(log.timestamp).toISOString(),
        msg: log.message,
        origin: log.origin,
        ctx: Object.keys(log.context).length > 0 ? log.context : undefined,
      },
      errorSerializer,
    );

    // NOTE: If the stream applies backpressure, we will lose logs. I believe
    // this is the right tradeoff. We can't prevent the app from generating
    // more logs, and if we buffered it would risk running out of memory and
    // crashing the process.
    //
    // It is unlikely that a file or tty will apply backpressure in practice.
    stream.write(`${output}\n`);
  };
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

interface Config {
  /** Where to print logs. */
  stream: Writable;
}
