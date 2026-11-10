import type { Log, LogProcessor } from '../types';
import { createBuffer } from './buffer';
import { createRouter } from './router';

/**
 * A gate over a log stream. Install {@link LogValve.processor} in a pipeline
 * and control the flow with {@link LogValve.open} and {@link LogValve.close}.
 *
 * While open, logs stream straight through to the downstream processor. While
 * closed, they're held in a ring buffer and released as a single batch the
 * next time it opens.
 */
export interface LogValve {
  /** The processor to install upstream. Forwards or buffers each log. */
  processor: LogProcessor;

  /** Flush buffered logs to the drain, then stream onward. */
  open: () => void;

  /** Begin buffering logs. */
  close: () => void;
}

/** Options for {@link createValve}. */
export interface LogValveOptions {
  /**
   * How many logs the buffer retains while closed. Once full, each new log
   * overwrites the oldest. Defaults to `Infinity`.
   */
  capacity?: number;

  /** Receives each log while the valve is open. */
  processor: LogProcessor;

  /**
   * Receives everything buffered while closed, in arrival order, as one batch
   * when the valve opens. Not called if nothing was buffered.
   */
  drain: (logs: Log[]) => void;

  /**
   * Whether the valve starts open. Required: the initial state is a decision
   * every caller should make deliberately.
   */
  open: boolean;
}

/**
 * Create a {@link LogValve}. Reach for it to hold logs while a downstream
 * isn't ready, then release them all at once when it is.
 */
export const createValve = ({
  capacity,
  drain,
  processor,
  open: startOpen,
}: LogValveOptions): LogValve => {
  const buffer = createBuffer({ capacity });
  const router = createRouter(startOpen ? 'open' : 'closed', {
    closed: buffer.processor,
    open: processor,
  });

  return {
    processor: router.processor,

    open: () => {
      // Route before draining so a log emitted from inside `drain` streams
      // straight through. `buffer.clear()` resets before returning, so it can't
      // land in the batch already released.
      router.select('open');

      const logs = buffer.clear();
      if (logs.length > 0) drain(logs);
    },

    close: () => {
      router.select('closed');
    },
  };
};
