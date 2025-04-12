import type { Log, LogProcessor } from '@holz/core';
import { parse, matches } from './string-match';

/**
 * Only forwards logs who's origin matches the given pattern. It works the
 * same as the popular `debug` module.
 *
 * Patterns allow wildcards and negation. For example, the pattern `my-app*`
 * will match all logs with the origin `my-app` or `my-app:foo` or
 * `my-app:foo:bar`. The pattern `*, -my-app` will match all logs except those
 * with the origin `my-app`.
 *
 * @example
 * createPatternFilter({
 *   pattern: 'my-app*, -spammy:library',
 *   processor: backend,
 * })
 */
export const createPatternFilter = ({
  processor,
  pattern,
}: Config): LogProcessor => {
  const filters = parse(pattern);

  return (log: Log) => {
    if (matches(filters, log.origin.join(':'))) {
      processor(log);
    }
  };
};

interface Config {
  /** A set of patterns to test against `log.origin`. */
  pattern: string;

  /** Where to send logs if they pass the filter. */
  processor: LogProcessor;
}
