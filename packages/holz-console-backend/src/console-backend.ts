import type { Log, LogProcessor } from '@holz/core';
import { timeDelta } from './time-delta';

/**
 * A backend that pretty-prints logs to a browser console, or any
 * remote-attached console.
 */
export function createConsoleBackend(options: Options = {}): LogProcessor {
  const output = options.console ?? console;
  let lastTimestamp: Date;

  return (log: Log) => {
    const now = new Date();

    const segments = [
      {
        include: true,
        format: '%s',
        values: [log.message],
      },
      {
        include: Object.keys(log.context).length > 0,
        format: '%o', // Chrome hides object content with `%O`.
        values: [log.context],
      },
      {
        include: true,
        format: '%c%s',
        values: ['color: gray', timeDelta(now, lastTimestamp)],
      },
      {
        include: log.origin.length > 0,
        format: '%c%s',
        values: [
          'color: rgba(128, 128, 128, 0.6); font-style: italic',
          log.origin.join(':'),
        ],
      },
    ].filter((segment) => segment.include);

    const format = segments.map((segment) => segment.format).join(' ');
    const values = segments.flatMap<unknown>((segment) => segment.values);

    // Browsers have UIs for filtering by log level. Leverage that.
    output[log.level](format, ...values);

    // Track the time spent between logs.
    lastTimestamp = now;
  };
}

interface Options {
  console?: MinimalConsole;
}

/**
 * A subset of the Console interface. Must support printf-style interpolation.
 * @see https://console.spec.whatwg.org/#formatting-specifiers
 */
export type MinimalConsole = Pick<Console, 'debug' | 'info' | 'warn' | 'error'>;
