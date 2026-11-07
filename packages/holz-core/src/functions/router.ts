import type { LogProcessor } from '../types';

/**
 * Switches a log stream between named destinations. Install
 * {@link LogRouter.processor} in a pipeline and pick where logs go with
 * {@link LogRouter.select}. Exactly one destination receives each log.
 */
export interface LogRouter<Name extends string> {
  /** The processor to install upstream. Forwards to the active destination. */
  processor: LogProcessor;

  /** Send subsequent logs to the named destination. */
  select: (name: Name) => void;
}

/**
 * Create a {@link LogRouter} over a fixed set of destinations, starting at
 * `initial`. Reach for it when a stream's sink changes at runtime — e.g. a
 * buffer until a backend is ready, then the backend.
 */
export const createRouter = <Name extends string>(
  initial: NoInfer<Name>,
  destinations: Record<Name, LogProcessor>,
): LogRouter<Name> => {
  let active = destinations[initial];

  return {
    processor: (log) => active(log),
    select: (name) => {
      active = destinations[name];
    },
  };
};
