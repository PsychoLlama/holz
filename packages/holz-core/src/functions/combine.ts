import type { Log, LogProcessor } from '../types';

/**
 * Combine several log processors into a single log processor. Each one is
 * called in sequence. Useful for sending a single log to multiple log
 * destinations.
 */
export const combine =
  (processors: Array<LogProcessor>): LogProcessor =>
  (log: Log) =>
    processors.forEach((processor) => processor(log));
