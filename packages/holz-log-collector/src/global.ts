import type { Log, LogProcessor } from '@holz/core';

const MATCH_ALL = () => true;

/**
 * Overrides the default log destination for all loggers in the app. Call this
 * early on startup. If logs are sent before registering the collector, they
 * will be lost.
 */
export const setGlobalLogCollector = ({
  processor,
  condition: match = MATCH_ALL,
}: InterceptorConfig) => {
  globalScope[COLLECTOR_SYMBOL] = { processor, condition: match };
};

/**
 * Remove the global log collector restoring defaults. Safe to call regardless
 * of whether one is set.
 */
export const unsetGlobalLogCollector = () => {
  delete globalScope[COLLECTOR_SYMBOL];
};

interface InterceptorConfig {
  /** Plugin handling all logs captured by the interceptor. */
  processor: LogProcessor;

  /**
   * Only capture logs matching this function. Return `false` to use the
   * default log destination. Defaults to capture all logs.
   */
  condition?: (log: Log) => boolean;
}

// As of 2025-04-12 there is no way to declare a symbol on `globalThis`.
export const globalScope = globalThis as unknown as GlobalContext;

// Stored in the global scope. Uses the symbol registry in case multiple
// versions of Holz are loaded in the same context.
export const COLLECTOR_SYMBOL = Symbol.for('@holz/log-collector');

interface GlobalContext {
  [COLLECTOR_SYMBOL]?: Required<InterceptorConfig>;
}
