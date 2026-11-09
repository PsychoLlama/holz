import type { Log, LogProcessor } from '../types';

/**
 * Groups a log stream into fixed-size batches. Install
 * {@link LogBatcher.processor} in a pipeline; each full batch is handed to
 * the sink in one call.
 */
export interface LogBatcher {
  /** The processor to install upstream. Flushes once a batch fills. */
  processor: LogProcessor;

  /** Flush the pending batch to the sink early. No-op when empty. */
  drain: () => void;

  /** Discard the pending batch without flushing it and return its logs. */
  clear: () => Log[];
}

/** Options for {@link createBatcher}. */
export interface LogBatcherOptions {
  /** How many logs make a full batch. */
  size: number;

  /** Receives each batch, in arrival order. */
  sink: (logs: Log[]) => void;
}

/**
 * Create a {@link LogBatcher}. Reach for it when a downstream benefits from
 * receiving logs in bulk, e.g. one network request or transaction per batch.
 */
export const createBatcher = ({
  size,
  sink,
}: LogBatcherOptions): LogBatcher => {
  let pending: Log[] = [];

  const drain = () => {
    if (pending.length === 0) return;

    // Swap before calling the sink. A throwing sink can't leave the batch to
    // grow unbounded, and a log emitted from inside the sink starts the next
    // batch instead of mutating the one being flushed.
    const batch = pending;
    pending = [];

    sink(batch);
  };

  const processor: LogProcessor = (log) => {
    pending.push(log);

    if (pending.length >= size) drain();
  };

  const clear = () => {
    const discarded = pending;
    pending = [];

    return discarded;
  };

  return { processor, drain, clear };
};
