# `@holz/idb-backend`

Stream logs into [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/Window/indexedDB). Many instances can write to the same database, including [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) and [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

> [!CAUTION]
> This package is experimental and unstable. It is not ready for production.

## Examples

- **Multi-process o11y:** Aggregate events across tabs, processes, and PWAs without coordinating.
- **Offline cache:** Persist logs and retry upload until it's successful.
- **Error context:** Query recent logs as breadcrumbs in a bug report.
- **Crash debugging:** See what happened before a tab crashed or reloaded.
- **Local-first apps:** Stream to storage as though it's a log file in a desktop app.

## Usage

```typescript
import { createLogger } from '@holz/core';
import { createIdbBackend, defineDatabase } from '@holz/idb-backend';

const { close, flush, processor } = createIdbBackend({
  batch: { size: 50 },
  retain: 10_000,
  onError: console.error,

  // OPTIONAL: Configure where logs are stored along with custom indexes.
  db: defineDatabase('@holz', 'logs', (migrations) => migrations),

  // OPTIONAL: Limit how many logs queue while waiting for the DB to open.
  buffer: { capacity: 1_000 },
});

const logger = createLogger(processor);
```

## Options

- `batch.size`: How many logs make a full batch.
- `retain`: Max number of logs to keep. See [Retention](#retention).
- `onError`: Receives errors, such as a database that fails to open or a log that can't be serialized.
- `buffer.capacity` (optional): How many logs to hold while the database opens. Unbounded by default. Once full, new logs overwrite the oldest.
- `db` (optional): Where logs are persisted. See [Customizing the Database](#customizing-the-database). Defaults to the `logs` table in the `@holz` database.

## Batching and Close Events

Logs persist in batches. If the process or tab closes before a batch is filled, **pending logs will be lost**.

Guard the case by detecting a closing page and explicitly flushing the queue:

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});
```

Flushing only writes the pending batch. Logs still waiting for the database to open are lost if the page closes first.

This only works for the main thread. Web Workers have no close signal and need to be messaged.

Service Workers are harder: they can terminate at any time. Consider setting batch size to `1` (write immediately) or accept the potential data loss.

## Retention

`retain` controls the maximum number of stored logs. When the count hits the limit, the oldest logs are pruned. Pruning follows write order, which may not match timestamp order.

Choose `Infinity` to manage pruning behavior manually.

## Customizing the Database

Use `defineDatabase(name, table)` to choose where logs go:

```typescript
import { createIdbBackend, defineDatabase } from '@holz/idb-backend';

const backend = createIdbBackend({
  db: defineDatabase('my-app', 'logs'),
  // ...
});
```

Multiple backends may share one database, as long as they agree on its definition.

### Migrations

This plugin only persists logs. It makes no assumptions about how they're queried.

To create a custom index, extend the list of default migrations.

> [!WARNING]
> Be careful: this can break the database.
>
> - Never reorder or remove migrations that shipped to clients.
> - Always anchor custom migrations against `name` so future migrations apply in the correct order.

```typescript
const descriptor = defineDatabase('@holz', 'logs', (migrations) => {
  return migrations.flatMap((migration) => {
    if (migration.name !== 'init') return migration;

    return [
      migration,
      {
        name: 'index-by-timestamp',
        run: (tx) => {
          tx.objectStore('logs').createIndex('by-timestamp', 'timestamp');
        },
      },
    ];
  });
});
```

The primary object store is owned by this plugin. Anything else (indexes, other object stores) is fair game.

> [!NOTE]
> Tabs still running an older release reconnect after an upgrade and use the new schema as-is. That means writes **must be compatible across versions**.

## Reading Logs

Logs are stored as structured clones of `Log` objects with auto-incrementing keys, so standard IndexedDB APIs work.

A helper opens the database at its current version, applying any missing migrations, or accepting a newer schema from another tab:

```typescript
import { openDatabase } from '@holz/idb-backend/database';

const db = await openDatabase(descriptor);
const logs = await new Promise((resolve, reject) => {
  const request = db.transaction('logs').objectStore('logs').getAll();

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

db.close();
```

Close the connection promptly. While open, it blocks other tabs from upgrading or deleting the database.

For complex work, the [`wrap(...)` from idb](https://www.npmjs.com/package/idb#wrap) provides a better API.

## Wiping the Database

Helpful in browser tests. This helper is effectively a thin promise wrapper over [indexedDB.deleteDatabase](https://developer.mozilla.org/en-US/docs/Web/API/IDBFactory/deleteDatabase).

```typescript
import { deleteDatabase } from '@holz/idb-backend/database';

// Delete the logs database.
await deleteDatabase('@holz');
```

Note: a live backend reconnects as soon as the database is deleted, which recreates it empty. Call `close()` first to stop it.
