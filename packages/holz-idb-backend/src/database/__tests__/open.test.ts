import type { Migration } from '../migrations';
import { openCurrent, openExisting, openOrUpgrade } from '../open';
import { deleteDatabase } from '../delete-database';
import { createSchemaContext } from './fixtures';

const createMigration = (name: string) => ({
  name,
  run: vi.fn<Migration['run']>(),
});

const createThrowingMigration = (error: Error): Migration => ({
  name: 'broken',
  run: () => {
    throw error;
  },
});

// Pairs a test database with arbitrary migrations.
const define = (name: string, migrations: Migration[] = []) => ({
  name,
  table: 'test-table',
  migrations,
});

describe('openOrUpgrade', () => {
  it('opens at the version implied by the migrations', async () => {
    await using context = createSchemaContext();

    const database = await openOrUpgrade(
      define(context.schema.name, [
        createMigration('first'),
        createMigration('second'),
      ]),
    );

    database.close();

    expect(database.version).toBe(2);
  });

  it('runs every migration in order on a new database', async () => {
    await using context = createSchemaContext();
    const calls: string[] = [];
    const migrations = ['first', 'second'].map((name) => ({
      name,
      run: () => void calls.push(name),
    }));

    (await openOrUpgrade(define(context.schema.name, migrations))).close();

    expect(calls).toEqual(['first', 'second']);
  });

  it('passes the upgrade transaction to each migration', async () => {
    await using context = createSchemaContext();
    const migration = createMigration('first');

    const database = await openOrUpgrade(
      define(context.schema.name, [migration]),
    );
    database.close();

    expect(migration.run).toHaveBeenCalledWith(
      expect.objectContaining({ db: database, mode: 'versionchange' }),
    );
  });

  it('runs only the migrations the database has not seen', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const second = createMigration('second');

    (await openOrUpgrade(define(name, [first]))).close();
    (await openOrUpgrade(define(name, [first, second]))).close();

    expect(first.run).toHaveBeenCalledTimes(1);
    expect(second.run).toHaveBeenCalledTimes(1);
  });

  it('runs nothing when the database is current', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const migration = createMigration('first');

    (await openOrUpgrade(define(name, [migration]))).close();
    (await openOrUpgrade(define(name, [migration]))).close();

    expect(migration.run).toHaveBeenCalledTimes(1);
  });

  it('rejects when the database is past the migrations', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const second = createMigration('second');

    (await openOrUpgrade(define(name, [first, second]))).close();

    await expect(openOrUpgrade(define(name, [first]))).rejects.toMatchObject({
      name: 'VersionError',
    });
  });

  it('rejects with the error a migration throws', async () => {
    await using context = createSchemaContext();
    const error = new Error('Migration failed.');
    const migration = createThrowingMigration(error);

    await expect(
      openOrUpgrade(define(context.schema.name, [migration])),
    ).rejects.toBe(error);
  });

  it('creates nothing when a migration on a new database throws', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const migration = createThrowingMigration(new Error('Migration failed.'));

    await expect(openOrUpgrade(define(name, [migration]))).rejects.toThrow();

    const databases = await indexedDB.databases();
    expect(databases.map((database) => database.name)).not.toContain(name);
  });

  it('rolls back the whole upgrade when a migration throws', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const added = {
      name: 'added',
      run: (transaction: IDBTransaction) =>
        void transaction.db.createObjectStore('added'),
    };
    const broken = createThrowingMigration(new Error('Migration failed.'));

    (await openOrUpgrade(define(name, [first]))).close();
    await expect(
      openOrUpgrade(define(name, [first, added, broken])),
    ).rejects.toThrow();

    const database = await openOrUpgrade(define(name, [first]));
    database.close();

    expect(database.version).toBe(1);
    expect([...database.objectStoreNames]).toEqual([]);
    expect(first.run).toHaveBeenCalledTimes(1);
  });
});

describe('openExisting', () => {
  it('opens at the current version', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const migrations = [createMigration('first'), createMigration('second')];

    (await openOrUpgrade(define(name, migrations))).close();
    const database = await openExisting(define(name));
    database.close();

    expect(database.version).toBe(2);
  });

  it('rejects and creates nothing when the database is missing', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;

    await expect(openExisting(define(name))).rejects.toMatchObject({
      name: 'AbortError',
    });

    const databases = await indexedDB.databases();
    expect(databases.map((database) => database.name)).not.toContain(name);
  });
});

describe('openCurrent', () => {
  it('creates and migrates a new database', async () => {
    await using context = createSchemaContext();
    const migration = createMigration('first');

    const database = await openCurrent(
      define(context.schema.name, [migration]),
    );
    database.close();

    expect(database.version).toBe(1);
    expect(migration.run).toHaveBeenCalledTimes(1);
  });

  it('upgrades a database behind the migrations', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const second = createMigration('second');

    (await openOrUpgrade(define(name, [first]))).close();
    const database = await openCurrent(define(name, [first, second]));
    database.close();

    expect(database.version).toBe(2);
    expect(second.run).toHaveBeenCalledTimes(1);
  });

  it('opens a database past the migrations as it stands', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const second = createMigration('second');

    (await openOrUpgrade(define(name, [first, second]))).close();
    const database = await openCurrent(define(name, [first]));
    database.close();

    expect(database.version).toBe(2);
  });

  it('starts over when the newer database gets deleted', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const newer = [createMigration('older'), createMigration('newer')];

    (await openOrUpgrade(define(name, newer))).close();
    const opening = openCurrent(define(name, [first]));

    // Lands between the failed migrating open and the versionless one, since
    // requests run in order and the versionless open isn't queued yet.
    await deleteDatabase(name);
    const database = await opening;
    database.close();

    expect(database.version).toBe(1);
    expect(first.run).toHaveBeenCalledTimes(1);
  });

  it('rejects with the error a migration throws', async () => {
    await using context = createSchemaContext();
    const error = new Error('Migration failed.');

    await expect(
      openCurrent(
        define(context.schema.name, [createThrowingMigration(error)]),
      ),
    ).rejects.toBe(error);
  });
});
