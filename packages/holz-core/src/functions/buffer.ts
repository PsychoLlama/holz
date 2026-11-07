import type { Log, LogProcessor } from '../types';

/**
 * A bounded ring buffer over a log stream. Install {@link LogBuffer.processor}
 * in a pipeline and collect what it held with {@link LogBuffer.drain}.
 */
export interface LogBuffer {
  /** The processor to install upstream. Holds every log it receives. */
  processor: LogProcessor;

  /** Empty the buffer, returning the held logs in arrival order. */
  drain: () => Log[];
}

/** Options for {@link createBuffer}. */
export interface LogBufferOptions {
  /**
   * How many logs the buffer retains. Once full, each new log overwrites the
   * oldest. A non-negative integer or `Infinity`; `0` keeps nothing,
   * `Infinity` (the default) is unbounded.
   */
  capacity?: number;
}

/**
 * Create a {@link LogBuffer}. Reach for it to hold logs until a consumer is
 * ready to take them, e.g. as the initial destination of a router.
 */
export const createBuffer = ({
  capacity = Infinity,
}: LogBufferOptions = {}): LogBuffer => {
  // Ring buffer that grows lazily up to `capacity`, then overwrites in place.
  // Pushing keeps the array packed, and avoids a large up-front allocation
  // when `capacity` is big or Infinity. `oldest` indexes the oldest entry
  // (the next slot to overwrite once full); it stays 0 while growing.
  const buffer: Log[] = [];
  let oldest = 0;

  const processor: LogProcessor = (log) => {
    if (buffer.length < capacity) {
      buffer.push(log);
    } else if (capacity > 0) {
      buffer[oldest] = log;
      oldest = (oldest + 1) % capacity;
    }
  };

  const drain = () => {
    // The ring holds two contiguous runs, `oldest` to the end then the start
    // up to `oldest`, so joining those slices restores arrival order.
    const logs = buffer.slice(oldest).concat(buffer.slice(0, oldest));

    buffer.length = 0;
    oldest = 0;

    return logs;
  };

  return { processor, drain };
};
