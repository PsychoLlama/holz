import type { Writable } from 'node:stream';
import { EOL } from 'node:os';
import { inspect } from 'node:util';
import {
  level,
  type LogLevel,
  type Log,
  type LogContext,
  type LogProcessor,
} from '@holz/core';

/**
 * Prints logs to a writable stream in plaintext. Optimized for log files.
 *
 * @example
 * createStreamBackend({
 *   stream: fs.createWriteStream('my-app.log', { flags: 'a' }),
 * })
 */
export const createStreamBackend = ({ stream }: Config): LogProcessor => {
  return (log: Log) => {
    const { error, ...plainContext } = log.context;
    const time = new Date(log.timestamp).toISOString();
    const level = LOG_LEVELS[log.level];
    const context = stringifyContext(plainContext);
    const namespace = log.origin.length ? `[${log.origin.join(':')}] ` : '';

    const header = `${time} ${level} ${namespace}`;
    const message = multilineIndent(header.length, log.message);
    const output = `${header}${message}${context ? ' ' + context : ''}`;
    const errorMessage = error ? inspect(error, { colors: false }) + EOL : '';

    // NOTE: If the stream applies backpressure, we will lose logs. I believe
    // this is the right tradeoff. We can't prevent the app from generating
    // more logs, and if we buffered it would risk running out of memory and
    // crashing the process.
    //
    // It is unlikely that a file or tty will apply backpressure in practice.
    stream.write(`${output}${EOL}${errorMessage}`);
  };
};

/**
 * Some messages will ruin your output without proper indentation. Stack
 * traces are a good example of this.
 *
 * Supports Unix + DOS line endings.
 */
const multilineIndent = (offset: number, message: string) =>
  message.replace(/(\r?\n)/g, (newline) => newline + ' '.repeat(offset));

// { id: 123, type: 'article' } -> 'id=123 type="article"'
const stringifyContext = (context: LogContext) =>
  Object.entries(context)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ');

const LOG_LEVELS: Record<LogLevel, string> = {
  [level.trace]: 'TRACE',
  [level.debug]: 'DEBUG',
  [level.info]: 'INFO ',
  [level.warn]: 'WARN ',
  [level.error]: 'ERROR',
  [level.fatal]: 'FATAL',
};

interface Config {
  /** Where to print logs. Normally `process.stderr`. */
  stream: Writable;
}
