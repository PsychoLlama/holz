import type { Log, LogProcessor } from '@holz/core';
import { LogLevel } from '@holz/core';
import { color, code } from './ansi-codes';

/**
 * A backend that prints logs to a 3-bit ansi terminal. This should work on
 * most Unix systems and Windows >= 10.
 *
 * NOTE: This is not smart enough to detect if the output is a TTY or if it
 * supports colors, nor is this the appropriate place to check. Without color
 * ques, the printed text is much less understandable. It is better to check
 * when constructing the logger instead.
 */
export default class AnsiTerminalBackend implements LogProcessor {
  private console: MinimalConsole;

  constructor(options: Options = {}) {
    this.console = options.console ?? console;
  }

  processLog(log: Log) {
    const timestamp = this.getTimestamp(new Date());
    const segments = [
      {
        include: true,
        command: '%s',
        content: `${code.reset}${code.dim}${timestamp}${code.reset}`,
      },
      {
        include: true,
        command: '%s',
        content: logLevelLabel[log.level],
      },
      {
        include: true,
        command: '%s',
        content: log.message,
      },
      {
        include: log.origin.length > 0,
        command: '%s',
        content: `${code.dim}${log.origin.join(':')}${code.reset}`,
      },
      {
        include: Object.keys(log.context).length > 0,
        command: '%O',
        content: log.context,
      },
    ].filter((segment) => segment.include);

    const format = segments.map((segment) => segment.command).join(' ');
    const values = segments.map((segment) => segment.content);

    // CLIs typically print interactive messages to stdout and logs to stderr.
    this.console.error(format, ...values);
  }

  // ISO-8601 timestamp with milliseconds.
  private getTimestamp(date: Date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

    return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
  }
}

// Trailing whitespace is important for alignment.
const logLevelLabel: Record<LogLevel, string> = {
  [LogLevel.Debug]: `${color.blue}DEBUG${code.reset}`,
  [LogLevel.Info]: `${color.green}INFO${code.reset} `,
  [LogLevel.Warn]: `${color.yellow}WARN${code.reset} `,
  [LogLevel.Error]: `${color.red}ERROR${code.reset}`,
};

interface Options {
  console?: MinimalConsole;
}

/**
 * A subset of the Console interface. Must support printf-style interpolation.
 * @see https://console.spec.whatwg.org/#formatting-specifiers
 */
export type MinimalConsole = Pick<Console, 'log' | 'error'>;
