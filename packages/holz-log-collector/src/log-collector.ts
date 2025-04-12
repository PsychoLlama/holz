import type { LogProcessor } from '@holz/core';
import { globalScope, COLLECTOR_SYMBOL } from './global';

/**
 * Redirects logs to a global collector if one is configured. This is designed
 * with apps in mind, which may want to aggregate logs from multiple sources.
 */
export const createLogCollector =
  (config: Config): LogProcessor =>
  (log) => {
    const collector = globalScope[COLLECTOR_SYMBOL];

    if (collector?.condition(log)) {
      collector.processor(log);
    } else {
      config.fallback(log);
    }
  };

export interface Config {
  fallback: LogProcessor;
}
