import type { DatabaseDefinition } from './define-database';
import { promisifyRequest } from './promise';

/**
 * Open a database at the version implied by `migrations`, applying any it
 * hasn't seen. Rejects if the open fails or the database is already past that
 * version. If a migration throws, rejects with its error and rolls back every
 * migration in the upgrade.
 */
export const openOrUpgrade = async ({
  name,
  migrations,
}: DatabaseDefinition): Promise<IDBDatabase> => {
  const request = indexedDB.open(name, migrations.length);
  let migrationError: unknown;

  request.onupgradeneeded = (event) => {
    try {
      migrations
        .slice(event.oldVersion)
        .forEach((migration) => migration.run(request.transaction!));
    } catch (error) {
      // Left uncaught, the browser still aborts the upgrade, but the error
      // escapes to the global scope and the request fails with `AbortError`.
      migrationError = error;
      request.transaction?.abort();
    }
  };

  try {
    return await promisifyRequest(request);
  } catch (error) {
    // Wait for the request to fail so the rollback is done before rejecting.
    throw migrationError ?? error;
  }
};
