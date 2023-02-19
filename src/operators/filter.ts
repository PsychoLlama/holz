import type { Log, LogProcessor } from '../types';

class LogFilter implements LogProcessor {
  constructor(
    private predicate: (log: Log) => boolean,
    private processor: LogProcessor
  ) {}

  processLog(log: Log) {
    if (this.predicate(log)) {
      this.processor.processLog(log);
    }
  }
}

/**
 * Filter logs based on a filter function. If the function returns true, the
 * log is kept and forwarded onto the next processor, otherwise it is
 * discarded.
 */
export default function filter(
  /** Returns `true` to forward the log. */
  predicate: (log: Log) => boolean,
  /** Where to send the log if it passes the filter. */
  processor: LogProcessor
): LogProcessor {
  return new LogFilter(predicate, processor);
}
