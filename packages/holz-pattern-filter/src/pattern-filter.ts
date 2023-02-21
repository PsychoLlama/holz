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
 * @example new PatternFilter('my-app*, -spammy:library', backend)
 */
export default class PatternFilter implements LogProcessor {
  private filters: ReturnType<typeof parse>;

  constructor(
    /** A set of patterns to test against `log.origin`. */
    readonly pattern: string,

    /** Where to send logs if they pass the filter. */
    private processor: LogProcessor
  ) {
    this.filters = parse(pattern);
  }

  processLog(log: Log) {
    if (matches(this.filters, log.origin.join(':'))) {
      this.processor.processLog(log);
    }
  }
}
