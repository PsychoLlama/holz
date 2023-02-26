import type { Log, LogProcessor } from '../types';

/**
 * Combine several log processors into a single log processor. Each one is
 * called in sequence. Useful for sending a single log to multiple log
 * destinations.
 */
export default function combine(processors: Array<LogProcessor>): LogProcessor {
  return (log: Log) => processors.forEach((processor) => processor(log));
}
