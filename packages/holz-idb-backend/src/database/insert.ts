import type { Log } from '@holz/core';

import type { DatabaseDefinition } from './define-database';
import { promisifyTransaction } from './promise';

/** Options for {@link insert}. */
export interface InsertOptions {
  /** Database whose object store to write to. */
  db: DatabaseDefinition;

  /** Max number of logs to keep. Discards the earliest written first. */
  retain: number;
}

/**
 * Write a batch of logs in a single transaction, then discard the oldest
 * until at most `retain` remain. Saves every log it can. Resolves once the
 * transaction commits, or rejects with every failure: the error itself if
 * there's one, or an `AggregateError` if there are more.
 */
export const insert = async (
  database: IDBDatabase,
  logs: Log[],
  { db: { table }, retain }: InsertOptions,
): Promise<void> => {
  const transaction = database.transaction(table, 'readwrite', {
    // Minor perf: flush on the OS's schedule. Don't force fsync.
    durability: 'relaxed',
  });

  const store = transaction.objectStore(table);
  const errors: unknown[] = [];

  // `add` throws on logs it can't save (e.g. uncloneable). Skip them so the
  // rest still land. Best-effort persistence assumes well-structured logs.
  const requests = logs.flatMap((log) => {
    try {
      return [store.add(log)];
    } catch (error) {
      errors.push(error);
      return [];
    }
  });

  // Keys auto-increment, so the newest `retain` logs sit at or above
  // `lastKey - retain + 1`. Gaps in the keys (e.g. rows deleted by hand) only
  // ever leave fewer than `retain`, never more.
  const last = requests.at(-1);

  // Undefined if every log failed to serialize. Nothing was added, so there's
  // nothing to prune.
  if (last) {
    last.onsuccess = () => {
      const lastKey = last.result as number;
      store.delete(IDBKeyRange.upperBound(lastKey - retain));
    };
  }

  try {
    await promisifyTransaction(transaction);
  } catch (error) {
    errors.push(error);
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(errors, 'Some logs could not be saved.');
  }
};
