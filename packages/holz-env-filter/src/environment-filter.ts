import type { Log, LogProcessor } from '@holz/core';
import { PatternFilter } from '@holz/pattern-filter';
import * as browserEnv from './browser-env';
import * as serverEnv from './server-env';
import { detectEnvironment } from './environment';

/**
 * Reads the debug pattern from the environment and uses it to filter logs.
 */
export default class EnvironmentFilter implements LogProcessor {
  private processor: LogProcessor;
  private filter!: PatternFilter;
  private env = detectEnvironment(globalThis.process);

  constructor(options: Config) {
    this.processor = options.processor;
    this.setPattern(
      options.pattern ?? this.loadPattern() ?? options.defaultPattern ?? '*'
    );
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
    this.env.save(pattern);
  }

  /**
   * Load from localStorage falling back to `process.env`. We always check
   * both because we might be in Electron, where both are defined and equally
   * valid.
   */
  private loadPattern() {
    return browserEnv.load() ?? serverEnv.load();
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