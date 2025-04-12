import type { Log, LogProcessor } from './types';

/**
 * Combine several log processors into a single log processor. Each one is
 * called in sequence. Useful for sending a single log to multiple log
 * destinations.
 */
export const combine =
  (processors: Array<LogProcessor>): LogProcessor =>
  (log: Log) =>
    processors.forEach((processor) => processor(log));

/**
 * Filter logs based on a filter function. If the function returns true, the
 * log is kept and forwarded onto the next processor, otherwise it is
 * discarded.
 */
export const filter =
  (
    /** Returns `true` to forward the log. */
    predicate: (log: Log) => boolean,
    /** Where to send the log if it passes the filter. */
    processor: LogProcessor,
  ): LogProcessor =>
  (log: Log) => {
    if (predicate(log)) {
      processor(log);
    }
  };
