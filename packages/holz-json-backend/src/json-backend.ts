import type { Writable } from 'node:stream';
import type { Log, LogProcessor } from '@holz/core';
import { serialize } from './serialize';

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
    // NOTE: If the stream applies backpressure, we will lose logs. I believe
    // this is the right tradeoff. We can't prevent the app from generating
    // more logs, and if we buffered it would risk running out of memory and
    // crashing the process.
    //
    // It is unlikely that a file or tty will apply backpressure in practice.
    stream.write(`${serialize(log)}\n`);
  };
};

interface Config {
  /** Where to print logs. */
  stream: Writable;
}
