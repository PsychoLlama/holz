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

/**
 * Open a database at its current version, without migrating it. Rejects with an
 * `AbortError` and creates nothing if the database doesn't exist.
 */
export const openExisting = ({
  name,
}: DatabaseDefinition): Promise<IDBDatabase> => {
  const request = indexedDB.open(name);

  // Only fires when there's no database, and this would leave an empty one.
  request.onupgradeneeded = () => request.transaction?.abort();

  return promisifyRequest(request);
};

/** Open at the version `migrations` implies, or any newer one a peer left. */
export const openCurrent = async (
  db: DatabaseDefinition,
): Promise<IDBDatabase> => {
  try {
    // Init, migrate, or open existing at current version.
    return await openOrUpgrade(db);
  } catch (error) {
    if (!hasErrorName(error, 'VersionError')) throw error;
  }

  try {
    // Open at a version beyond what our code knows about.
    return await openExisting(db);
  } catch (error) {
    if (!hasErrorName(error, 'AbortError')) throw error;
  }

  // Extreme edge case: future version deleted before we could open it.
  return openCurrent(db);
};

const hasErrorName = (error: unknown, name: string): boolean =>
  error instanceof DOMException && error.name === name;
