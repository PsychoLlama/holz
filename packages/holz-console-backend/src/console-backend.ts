import type { Log, LogProcessor } from '@holz/core';
import { LogLevel } from '@holz/core';

/**
 * A backend that pretty-prints logs to a browser console, or any
 * remote-attached console.
 */
export default class ConsoleBackend implements LogProcessor {
  private console: MinimalConsole;

  constructor(options: Options = {}) {
    this.console = options.console ?? console;
  }

  processLog(log: Log) {
    const segments = [
      {
        include: true,
        command: '%c%s',
        content: log.message,
        style: `color: ${log.level === LogLevel.Debug ? 'gray' : 'unset'}`,
      },
      {
        include: Object.keys(log.context).length > 0,
        command: '%c%o', // Chrome hides object content with `%O`.
        content: log.context,
        style: '',
      },
      {
        include: log.origin.length > 0,
        command: '%c%s',
        content: log.origin.join(':'),
        style: 'color: rgba(128, 128, 128, 0.6); font-style: italic',
      },
    ].filter((segment) => segment.include);

    const command = segments.map((segment) => segment.command).join(' ');
    const values = segments.flatMap((segment) => [
      segment.style,
      segment.content,
    ]);

    // Errors should always use stderr.
    const channel = LOG_METHOD[log.level];

    this.console[channel](command, ...values);
  }
}

// Browsers have UIs for filtering by log level. Leverage that.
const LOG_METHOD: Record<LogLevel, keyof MinimalConsole> = {
  [LogLevel.Debug]: 'debug',
  [LogLevel.Info]: 'info',
  [LogLevel.Warn]: 'warn',
  [LogLevel.Error]: 'error',
};

interface Options {
  console?: MinimalConsole;
}

/**
 * A subset of the Console interface. Must support printf-style interpolation.
 * @see https://console.spec.whatwg.org/#formatting-specifiers
 */
export type MinimalConsole = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
