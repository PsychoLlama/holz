import type { Log, LogProcessor } from '../types';

class CombinedLogProcessor implements LogProcessor {
  constructor(private processors: Array<LogProcessor>) {
    // empty
  }

  processLog(log: Log) {
    this.processors.forEach((processor) => {
      processor.processLog(log);
    });
  }
}

/**
 * Combine several log processors into a single log processor. Each one is
 * called in sequence. Useful for sending a single log to multiple log
 * destinations.
 */
export default function combine(processors: Array<LogProcessor>): LogProcessor {
  return new CombinedLogProcessor(processors);
}
