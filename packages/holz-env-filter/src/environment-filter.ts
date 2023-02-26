import type { LogProcessor } from '@holz/core';
import { createPatternFilter } from '@holz/pattern-filter';
import * as browserEnv from './browser-env';
import * as serverEnv from './server-env';

export function createEnvironmentFilter({
  processor,
  pattern,
  defaultPattern,
}: Config): LogProcessor {
  return createPatternFilter({
    pattern: pattern ?? loadPattern() ?? defaultPattern ?? '*',
    processor,
  });
}

/**
 * Load from localStorage falling back to `process.env`. We always check both
 * because we might be in Electron, where both are defined and equally valid.
 */
function loadPattern() {
  return browserEnv.load(browserEnv.STORAGE_KEY) ?? serverEnv.load('DEBUG');
}

interface Config {
  /** Replace the detected pattern with something else. */
  pattern?: string;

  /** The default pattern to use if no pattern is provided. */
  defaultPattern?: string;

  /** Where to send the logs if they pass the filter. */
  processor: LogProcessor;
}
