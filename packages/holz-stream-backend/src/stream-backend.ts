import type { Writable } from 'node:stream';
import { EOL } from 'node:os';
import { LogLevel } from '@holz/core';
import type { Log, LogContext, LogProcessor } from '@holz/core';

/**
 * Prints logs to a writable stream in plaintext. Optimized for log files.
 *
 * @example
 * createStreamBackend({
 *   stream: fs.createWriteStream('my-app.log', { flags: 'a' }),
 * })
 */
export function createStreamBackend({ stream }: Config): LogProcessor {
  return (log: Log) => {
    const currentTime = new Date().toISOString();
    const level = LOG_LEVELS[log.level];
    const context = stringifyContext(log.context);
    const namespace = log.origin.length ? `[${log.origin.join(':')}] ` : '';

    const header = `${currentTime} ${level} ${namespace}`;
    const message = multilineIndent(header.length, log.message);
    const output = `${header}${message}${context ? ' ' + context : ''}`;

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
 * Some messages will ruin your output without proper indentation. Stack
 * traces are a good example of this.
 *
 * Supports Unix + DOS line endings.
 */
function multilineIndent(offset: number, message: string) {
  return message.replace(/(\r?\n)/g, (newline) => newline + ' '.repeat(offset));
}

// { id: 123, type: 'article' } -> 'id=123 type="article"'
function stringifyContext(context: LogContext) {
  return Object.entries(context)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join(' ');
}

const LOG_LEVELS: Record<LogLevel, string> = {
  [LogLevel.Trace]: 'TRACE',
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO ',
  [LogLevel.Warn]: 'WARN ',
  [LogLevel.Error]: 'ERROR',
  [LogLevel.Fatal]: 'FATAL',
};

interface Config {
  /** Where to print logs. Normally `process.stderr`. */
  stream: Writable;
}
