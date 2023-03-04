import type { LogProcessor } from '@holz/core';
import { createPatternFilter } from '@holz/pattern-filter';
import { getEnvironmentVariable, getLocalStorageKey } from './get-env';

export const createEnvironmentFilter = ({
  processor,
  pattern,
  defaultPattern,
  localStorageKey = 'debug',
  environmentVariable = 'DEBUG',
}: Config): LogProcessor => {
  /**
   * Load from localStorage falling back to `process.env`. We always check
   * both because we might be in Electron, where both are defined and equally
   * valid.
   */
  const loadPatternFromEnvironment = () => {
    return (
      getLocalStorageKey(localStorageKey) ??
      getEnvironmentVariable(environmentVariable)
    );
  };

  return createPatternFilter({
    processor,
    pattern: pattern ?? loadPatternFromEnvironment() ?? defaultPattern ?? '*',
  });
};

interface Config {
  /** Replace the detected pattern with something else. */
  pattern?: string;

  /** The default pattern to use if no pattern is provided. */
  defaultPattern?: string;

  /** Where to send the logs if they pass the filter. */
  processor: LogProcessor;

  /** The localStorage key where patterns are saved. Default is `debug`. */
  localStorageKey?: string;

  /** The environment variable where patterns are saved. Default is `DEBUG`. */
  environmentVariable?: string;
}
