import type { Log, LogProcessor } from '../types';

/**
 * Filter logs based on a filter function. If the function returns true, the
 * log is kept and forwarded onto the next processor, otherwise it is
 * discarded.
 *
 * @param predicate Returns `true` to forward the log.
 * @param processor Where to send the log if it passes the filter.
 */
export const filter =
  (predicate: (log: Log) => boolean, processor: LogProcessor): LogProcessor =>
  (log: Log) => {
    if (predicate(log)) {
      processor(log);
    }
  };
