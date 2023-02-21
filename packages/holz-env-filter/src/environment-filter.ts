import type { Log, LogProcessor } from '@holz/core';
import { PatternFilter } from '@holz/pattern-filter';

/**
 * Reads the debug pattern from the environment and uses it to filter logs.
 */
export default class EnvironmentFilter implements LogProcessor {
  private processor: LogProcessor;
  private filter!: PatternFilter;

  constructor(options: Config) {
    this.processor = options.processor;
    this.setPattern(options.pattern ?? options.defaultPattern ?? '*');
    // TODO: Hydrate the pattern from the environment.
  }

  processLog(log: Log) {
    this.filter.processLog(log);
  }

  /**
   * Change the pattern used to filter logs. If the environment supports it,
   * it will attempt to persist your preference.
   */
  setPattern(pattern: string) {
    this.filter = new PatternFilter(pattern, this.processor);
    // TODO: Persist.
  }
}

interface Config {
  /** Replace the detected pattern with something else. */
  pattern?: string;

  /** The default pattern to use if no pattern is provided. */
  defaultPattern?: string;

  /** Where to send the logs if they pass the filter. */
  processor: LogProcessor;
}
