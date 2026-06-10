import { level, type LogLevel, type Log, type LogProcessor } from '@holz/core';

const encoder = new TextEncoder();

/**
 * Prints structured logs to a writable stream in NDJSON form. Optimized for
 * log files.
 *
 * Writes to a Web Streams `WritableStream<Uint8Array>` so the same backend
 * runs across Node, Deno, Bun, and the browser (e.g. OPFS). See the readme
 * for a Node file-stream example.
 *
 * @example
 * createJsonBackend({
 *   stream: new WritableStream({
 *     write: (chunk) => void process.stdout.write(chunk),
 *   }),
 * })
 *
 * @see https://github.com/ndjson/ndjson-spec
 */
export const createJsonBackend = ({ stream, signal }: Config): LogProcessor => {
  const writer = stream.getWriter();

  // Flush and release the writer when the caller signals shutdown. We close
  // gracefully rather than `abort` so queued writes drain and OPFS-style sinks
  // commit their data instead of discarding it. This is fire-and-forget: a
  // caller needing to await the flush should observe its own sink or resource
  // completion. Once closed, `desiredSize` is null and the guard below drops
  // any further logs.
  if (signal?.aborted) {
    writer.close().catch(noop);
  } else {
    signal?.addEventListener('abort', () => void writer.close().catch(noop), {
      once: true,
    });
  }

  return (log: Log) => {
    // Drop logs when the sink is overwhelmed rather than buffering them. We
    // can't slow down the application, and an unbounded queue would risk
    // exhausting memory and crashing the process. Losing logs is the better
    // failure mode. `desiredSize` is null once the stream errors or closes.
    if (writer.desiredSize === null || writer.desiredSize <= 0) {
      return;
    }

    // Follow the order of typical log statements. Be kind to the human
    // reader.
    const output = JSON.stringify(
      {
        level: labelForLevel[log.level],
        time: new Date(log.timestamp).toISOString(),
        msg: log.message,
        origin: log.origin,
        ctx: Object.keys(log.context).length > 0 ? log.context : undefined,
      },
      errorSerializer,
    );

    // NOTE: Fire-and-forget. We deliberately don't await the write - stalling
    // an application on logging would be a poor tradeoff. The returned promise
    // is ignored, with a no-op catch to avoid unhandled rejections if the sink
    // errors (e.g. a closed stream).
    writer.write(encoder.encode(`${output}\n`)).catch(noop);
  };
};

/** Swallows a rejected write so it doesn't surface as an unhandled rejection. */
const noop = () => {};

/**
 * Errors are not JSON serializable, but errors are naturally a crucial aspect
 * of any logging system. This unwraps errors into a JSON representation.
 */
const errorSerializer = (_key: string, value: unknown) => {
  if (value instanceof Error) {
    return {
      ...value, // Some custom errors have important custom properties.
      name: value.name,
      message: value.message,
      cause: value.cause,
    };
  }

  return value;
};

/**
 * Slightly heavier than logging the number, but easier to process
 * programmatically which is somewhat implied by a JSON backend.
 */
const labelForLevel = Object.fromEntries(
  Object.entries(level).map(([key, value]) => [value, key]),
) as Record<LogLevel, string>;

interface Config {
  /** Where to print logs. Each log is written as a line of UTF-8 NDJSON. */
  stream: WritableStream<Uint8Array>;

  /**
   * Closes the stream on abort, flushing queued writes and committing
   * OPFS-style sinks. Fire-and-forget: to await the flush, observe your own
   * sink or resource completion. Logs are dropped once shutdown begins.
   */
  signal?: AbortSignal;
}
