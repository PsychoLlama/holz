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
    const segments = [
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

    const command = segments.map((segment) => segment.command).join(' ');
    const values = segments.map((segment) => segment.content);

    // Errors should always use stderr.
    const channel: keyof MinimalConsole =
      log.level === LogLevel.Error ? 'error' : 'log';

    this.console[channel](command, ...values);
  }
}

const logLevelLabel: Record<LogLevel, string> = {
  [LogLevel.Debug]: `${code.bold}${color.cyan}debug${code.reset}`,
  [LogLevel.Info]: `${code.bold}${color.green}info${code.reset} `,
  [LogLevel.Warn]: `${code.bold}${color.yellow}warn${code.reset} `,
  [LogLevel.Error]: `${code.bold}${color.red}error${code.reset}`,
};

interface Options {
  console?: MinimalConsole;
}

/**
 * A subset of the Console interface. Must support printf-style interpolation.
 */
export interface MinimalConsole {
  /** Log to stdout. */
  log: Console['log'];

  /** Log to stderr. */
  error: Console['error'];
}
