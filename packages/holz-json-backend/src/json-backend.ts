import type { Writable } from 'node:stream';
import { EOL } from 'node:os';
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
 * @see http://ndjson.org
 */
export function createJsonBackend({ stream }: Config): LogProcessor {
  return (log: Log) => {
    // Follow the order of typical log statements. Be kind to the human
    // reader.
    const output = JSON.stringify({
      level: labelForLevel[log.level],
      time: new Date().toISOString(),
      msg: log.message,
      ctx: Object.keys(log.context).length > 0 ? log.context : undefined,
    });

    // NOTE: If the stream applies backpressure, we will lose logs. I believe
    // this is the right tradeoff. We can't prevent the app from generating
    // more logs, and if we buffered it would risk running out of memory and
    // crashing the process.
    //
    // It is unlikely that a file or tty will apply backpressure in practice.
    stream.write(`${output}${EOL}`);
  };
}

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
