import { level, type LogLevel, type Log, type LogProcessor } from '@holz/core';
import * as ansi from './ansi-codes';

/**
 * A backend that prints logs to a 3-bit ansi terminal. This should work on
 * most Unix systems and Windows >= 10.
 *
 * NOTE: This is not smart enough to detect if the output is a TTY or if it
 * supports colors, nor is this the appropriate place to check. Without color
 * ques, the printed text is much less understandable. It is better to check
 * when constructing the logger instead.
 */
export const createAnsiTerminalBackend = (
  options: Options = {},
): LogProcessor => {
  const output = options.console ?? console;
  const labelSizeInWhitespace = ' '.repeat(5); // char length of longest level type

  return (log: Log) => {
    const timestamp = formatAsTimestamp(new Date(log.timestamp));
    const timestampPrefix = `${ansi.reset}${ansi.dim}${timestamp}${ansi.reset}`;
    const segments = [
      {
        include: true,
        command: '%s',
        content: timestampPrefix,
      },
      {
        include: true,
        command: '%s',
        content: logLevelLabel[log.level],
      },
      {
        include: true,
        command: '%s',
        content: log.message.replace(
          /(\r?\n)/g,
          `$1${timestampPrefix} ${labelSizeInWhitespace} `,
        ),
      },
      {
        include: Object.keys(log.context).length > 0,
        command: '%O',
        content: log.context,
      },
      {
        include: log.origin.length > 0,
        command: '%s',
        content: `${ansi.dim}${log.origin.join(':')}${ansi.reset}`,
      },
    ].filter((segment) => segment.include);

    const format = segments.map((segment) => segment.command).join(' ');
    const values = segments.map((segment) => segment.content);

    // CLIs typically print interactive messages to stdout and logs to stderr.
    output.error(format, ...values);
  };
};

// This is an interactive TTY, so we can assume someone is watching. They
// probably know what day it is. Focus on the time.
const formatAsTimestamp = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
};

// Trailing whitespace is important for alignment.
const logLevelLabel: Record<LogLevel, string> = {
  [level.trace]: `${ansi.brightWhite}TRACE${ansi.reset}`,
  [level.debug]: `${ansi.blue}DEBUG${ansi.reset}`,
  [level.info]: `${ansi.green}INFO${ansi.reset} `,
  [level.warn]: `${ansi.yellow}WARN${ansi.reset} `,
  [level.error]: `${ansi.red}ERROR${ansi.reset}`,
  [level.fatal]: `${ansi.bold}${ansi.red}FATAL${ansi.reset}`,
};

interface Options {
  /**
   * Defaults the global `console`, but in NodeJS you can create a console
   * over any writable stream. It could be a file or a network socket.
   *
   * @see https://nodejs.org/api/console.html#new-consoleoptions
   */
  console?: Console;
}
