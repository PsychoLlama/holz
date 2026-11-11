import { defineDatabase } from '../define-database';
import { openOrUpgrade } from '../open';
import { deleteDatabase } from '../delete-database';

const uniqueName = () => `test-${crypto.randomUUID()}`;

const listDatabases = async () => {
  const databases = await indexedDB.databases();

  return databases.map((database) => database.name);
};

describe('deleteDatabase', () => {
  it('deletes the database', async () => {
    const name = uniqueName();

    (await openOrUpgrade(defineDatabase(name, 'logs'))).close();
    await deleteDatabase(name);

    expect(await listDatabases()).not.toContain(name);
  });

  it('resolves when the database does not exist', async () => {
    await expect(deleteDatabase(uniqueName())).resolves.toBeUndefined();
  });
});
