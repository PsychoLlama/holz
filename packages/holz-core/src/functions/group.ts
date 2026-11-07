import type { Log, LogProcessor } from '../types';

/**
 * Group several log processors into a single log processor. Each log fans out
 * to every processor, called in sequence. Useful for sending a single log to
 * multiple log destinations.
 */
export const createGroup =
  (processors: Array<LogProcessor>): LogProcessor =>
  (log: Log) =>
    processors.forEach((processor) => processor(log));
