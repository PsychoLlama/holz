import type { Writable } from 'node:stream';
import { EOL } from 'node:os';
import { LogLevel } from '@holz/core';
import type { Log, LogContext, LogProcessor } from '@holz/core';

/**
 * Prints logs to a writable stream in plaintext. Optimized for log files.
 *
 * @example
 * new StreamBackend({
 *   stream: fs.createWriteStream('my-app.log', { flags: 'a' }),
 * })
 */
export default class StreamBackend implements LogProcessor {
  private stream: Writable;

  constructor(options: Config) {
    this.stream = options.stream;
  }

  processLog(log: Log) {
    const currentTime = new Date().toISOString();
    const level = LOG_LEVELS[log.level];
    const context = this.stringifyContext(log.context);
    const namespace = log.origin.length ? `[${log.origin.join(':')}] ` : '';

    const header = `${currentTime} ${level} ${namespace}`;
    const message = this.multilineIndent(header.length, log.message);
    const output = `${header}${message}${context ? ' ' + context : ''}${EOL}`;

    // NOTE: If the stream applies backpressure, we will lose logs. I believe
    // this is the right tradeoff. We can't prevent the app from generating
    // more logs, and if we buffered it would risk running out of memory and
    // crashing the process.
    //
    // It is unlikely that a file or tty will apply backpressure in practice.
    this.stream.write(output);
  }

  // { id: 123, type: 'article' } -> 'id=123 type="article"'
  private stringifyContext(context: LogContext) {
    return Object.entries(context)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join(' ');
  }

  // Some messages will ruin your output without proper indentation. Stack
  // traces are a good example of this.
  //
  // Supports Unix + DOS line endings.
  private multilineIndent(offset: number, message: string) {
    return message.replace(
      /(\r?\n)/g,
      (newline) => newline + ' '.repeat(offset)
    );
  }
}

const LOG_LEVELS: Record<LogLevel, string> = {
  [LogLevel.Debug]: 'DEBUG',
  [LogLevel.Info]: 'INFO ',
  [LogLevel.Warn]: 'WARN ',
  [LogLevel.Error]: 'ERROR',
};

interface Config {
  /** Where to print logs. Normally `process.stderr`. */
  stream: Writable;
}
