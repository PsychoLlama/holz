import { level, type LogLevel, type Log, type LogProcessor } from '@holz/core';
import { timeDelta } from './time-delta';

/**
 * A backend that pretty-prints logs to a browser console, or any
 * remote-attached console.
 */
export const createConsoleBackend = (options: Options = {}): LogProcessor => {
  const output = options.console ?? console;
  let lastTimestamp: Date;

  return (log: Log) => {
    const time = new Date(log.timestamp);
    const { error, ...plainContext } = log.context;

    const segments = [
      {
        include: true,
        format: '%s',
        values: [log.message],
      },
      {
        include: Object.keys(plainContext).length > 0,
        format: '%o', // Chrome hides object content with `%O`.
        values: [plainContext],
      },
      {
        include: true,
        format: '%c%s',
        values: ['color: gray', timeDelta(time, lastTimestamp)],
      },
      {
        include: log.origin.length > 0,
        format: '%c%s',
        values: [
          'color: rgba(128, 128, 128, 0.6); font-style: italic',
          log.origin.join(':'),
        ],
      },
      {
        include: error,
        format: '%o',
        values: [error],
      },
    ].filter((segment) => segment.include);

    const format = segments.map((segment) => segment.format).join(' ');
    const values = segments.flatMap<unknown>((segment) => segment.values);

    // Browsers have UIs for filtering by log level. Leverage that.
    output[sink[log.level]](format, ...values);

    // Track the time spent between logs.
    lastTimestamp = time;
  };
};

const sink: Record<LogLevel, keyof MinimalConsole> = {
  [level.trace]: 'trace',
  [level.debug]: 'debug',
  [level.info]: 'info',
  [level.warn]: 'warn',
  [level.error]: 'error',
  [level.fatal]: 'error',
};

interface Options {
  console?: MinimalConsole;
}

/**
 * A subset of the Console interface. Must support printf-style interpolation.
 * @see https://console.spec.whatwg.org/#formatting-specifiers
 *
 * Note that `fatal` has no corresponding equivalent. It will be downgraded to
 * `error` when printed.
 */
export type MinimalConsole = Pick<
  Console,
  'trace' | 'debug' | 'info' | 'warn' | 'error'
>;
