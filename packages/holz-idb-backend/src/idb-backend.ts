import type { Log, LogProcessor } from '@holz/core';
import {
  createBatcher,
  createBuffer,
  createRouter,
} from '@holz/core/functions';
import type { LogBatcherOptions, LogBufferOptions } from '@holz/core/functions';

import { connect, defineDatabase, insert } from './database/internal';
import type { DatabaseDefinition } from './database/internal';

/** Options for {@link createIdbBackend}. */
export interface IdbBackendConfig {
  /**
   * Where logs are persisted, from {@link defineDatabase}. Defaults to the
   * `logs` table in the `@holz` database.
   */
  db?: DatabaseDefinition;

  /** Holds logs while the database opens. Unlimited by default. */
  buffer?: LogBufferOptions;

  /** Groups logs into batches, each written in a single transaction. */
  batch: Pick<LogBatcherOptions, 'size'>;

  /**
   * Max number of logs to retain. Discards the earliest written first, which
   * may not be the earliest timestamp.
   */
  retain: number;

  /**
   * Receives errors from the backend, such as a database that fails to open.
   * Report them however suits your app. For example, pass `console.error`.
   */
  onError: (error: unknown) => void;
}

/** A backend created by {@link createIdbBackend}. */
export interface IdbBackend {
  /** Install this in your logging pipeline. */
  processor: LogProcessor;

  /**
   * Write the pending batch now, without waiting for it to fill. Call this
   * when the app may stop soon, such as when the page is hidden. Logs still
   * waiting on the database to open aren't written.
   */
  flush: () => void;

  /**
   * Write any pending batch, then disconnect from the database and discard all
   * logs from then on.
   */
  close: () => void;
}

/**
 * Create the holz backend. Holds logs until the database opens, and discards
 * them if it can't.
 */
export const createIdbBackend = ({
  db = defineDatabase('@holz', 'logs'),
  batch: batchOptions,
  buffer: bufferOptions,
  retain,
  onError,
}: IdbBackendConfig): IdbBackend => {
  let connection: IDBDatabase | null = null;

  // Called when:
  // - DB (re)connects with buffered logs.
  // - Batch size is met.
  // - Explicitly flushed or closed.
  //
  // Caller responsible for ensuring a live connection before invocation.
  const write = (logs: Log[]) => {
    insert(connection!, logs, { db, retain }).catch(onError);
  };

  const batch = createBatcher({ ...batchOptions, sink: write });

  const { clear: clearBuffer, processor: buffer } = createBuffer(bufferOptions);
  const { select, processor: router } = createRouter('buffer', {
    buffer, // Queue while connecting.
    db: batch.processor, // Persist to IndexedDB.
    noop: () => {}, // Terminal state. Drops logs.
  });

  const discardAndYield = () => {
    select('noop'); // Ignore future logs.
    batch.clear(); // Clear pending batch.
    clearBuffer(); // Clear queued logs.
  };

  const disconnect = connect({
    db,

    // May invoke multiple times. Handle is released and re-acquired if new
    // tabs/processes have new migrations, if the DB is deleted, or if the
    // browser closes it (e.g. storage was cleared).
    onChange: (next) => {
      connection = next;
      select(connection ? 'db' : 'buffer');

      if (connection) {
        const buffered = clearBuffer();
        if (buffered.length) write(buffered);
      } else {
        // Move uncommitted logs to the buffer.
        batch.clear().forEach(buffer);
      }
    },

    // Unrecoverable error. Give up and sinkhole future logs.
    onError: (error) => {
      discardAndYield();
      onError(error);
    },
  });

  // Batches only fill while connected, so there's nothing to write otherwise.
  const flush = () => {
    if (connection) batch.flush();
  };

  const close = () => {
    flush();
    disconnect();
    discardAndYield();
  };

  return { processor: router, flush, close };
};
