import type { Log, LogProcessor } from './types';

/**
 * Combine several log processors into a single log processor. Each one is
 * called in sequence. Useful for sending a single log to multiple log
 * destinations.
 */
export function combine(processors: Array<LogProcessor>): LogProcessor {
  return (log: Log) => processors.forEach((processor) => processor(log));
}

/**
 * Filter logs based on a filter function. If the function returns true, the
 * log is kept and forwarded onto the next processor, otherwise it is
 * discarded.
 */
export function filter(
  /** Returns `true` to forward the log. */
  predicate: (log: Log) => boolean,
  /** Where to send the log if it passes the filter. */
  processor: LogProcessor,
): LogProcessor {
  return (log: Log) => {
    if (predicate(log)) {
      processor(log);
    }
  };
}
