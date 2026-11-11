import { connect } from '../connect';
import type { Migration } from '../migrations';
import { openOrUpgrade } from '../open';
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

/** Declare after the schema context, so it stops before the database goes. */
const startConnection = (name: string, migrations: Migration[]) => {
  const onChange = vi.fn<(database: IDBDatabase | null) => void>();
  const onError = vi.fn<(error: unknown) => void>();

  const close = connect({ db: define(name, migrations), onChange, onError });

  /** Wait for exactly `count` changes, returning the latest. */
  const waitForChanges = (count: number) =>
    vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(count);

      return onChange.mock.lastCall?.[0];
    });

  return { onChange, onError, waitForChanges, close, [Symbol.dispose]: close };
};

describe('connect', () => {
  it('provides the database once it opens', async () => {
    await using context = createSchemaContext();
    using connection = startConnection(context.schema.name, [
      createMigration('first'),
    ]);

    const database = await connection.waitForChanges(1);

    expect(database).toBeInstanceOf(IDBDatabase);
    expect(database?.version).toBe(1);
    expect(connection.onError).not.toHaveBeenCalled();
  });

  it('reports a failure to open', async () => {
    await using context = createSchemaContext();
    const error = new Error('Migration failed.');
    using connection = startConnection(context.schema.name, [
      createThrowingMigration(error),
    ]);

    await vi.waitFor(() =>
      expect(connection.onError).toHaveBeenCalledWith(error),
    );

    expect(connection.onChange).not.toHaveBeenCalled();
  });

  it('reports an error thrown while providing the database', async () => {
    await using context = createSchemaContext();
    const error = new Error('Consumer failed.');
    using connection = startConnection(context.schema.name, [
      createMigration('first'),
    ]);

    connection.onChange.mockImplementationOnce(() => {
      throw error;
    });

    await vi.waitFor(() =>
      expect(connection.onError).toHaveBeenCalledWith(error),
    );

    expect(connection.onChange).toHaveBeenCalledTimes(2);
    expect(connection.onChange).toHaveBeenLastCalledWith(null);
  });

  it('recreates the database when it gets deleted', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    using connection = startConnection(name, [first]);

    await connection.waitForChanges(1);
    await deleteDatabase(name);
    await connection.waitForChanges(3);

    expect(connection.onChange.mock.calls[1]).toEqual([null]);
    expect(first.run).toHaveBeenCalledTimes(2);
  });

  it('reconnects when a peer upgrade rolls back', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const broken = createThrowingMigration(new Error('Migration failed.'));
    using connection = startConnection(name, [first]);

    const original = await connection.waitForChanges(1);
    await expect(
      openOrUpgrade(define(name, [first, broken])),
    ).rejects.toThrow();
    const reconnected = await connection.waitForChanges(3);

    expect(connection.onChange.mock.calls[1]).toEqual([null]);
    expect(reconnected).not.toBe(original);
    expect(reconnected?.version).toBe(1);
    expect(connection.onError).not.toHaveBeenCalled();
  });

  it('reconnects at the new version after a peer upgrade', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const second = createMigration('second');
    using connection = startConnection(name, [first]);

    await connection.waitForChanges(1);
    const peer = await openOrUpgrade(define(name, [first, second]));
    peer.close();
    const reconnected = await connection.waitForChanges(3);

    expect(connection.onChange.mock.calls[1]).toEqual([null]);
    expect(reconnected?.version).toBe(2);
    expect(first.run).toHaveBeenCalledTimes(1);
    expect(second.run).toHaveBeenCalledTimes(1);
    expect(connection.onError).not.toHaveBeenCalled();
  });

  it('uses a database already past its migrations', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const newer = [createMigration('older'), createMigration('newer')];

    (await openOrUpgrade(define(name, newer))).close();
    using connection = startConnection(name, [first]);
    const database = await connection.waitForChanges(1);

    expect(database?.version).toBe(2);
    expect(first.run).not.toHaveBeenCalled();
    expect(connection.onError).not.toHaveBeenCalled();
  });

  it('starts over when the newer database gets deleted', async () => {
    await using context = createSchemaContext();
    const { name } = context.schema;
    const first = createMigration('first');
    const newer = [createMigration('older'), createMigration('newer')];

    (await openOrUpgrade(define(name, newer))).close();
    using connection = startConnection(name, [first]);

    // Lands between the failed migrating open and the versionless one, since
    // requests run in order and the versionless open isn't queued yet.
    await deleteDatabase(name);
    const database = await connection.waitForChanges(1);

    expect(database?.version).toBe(1);
    expect(first.run).toHaveBeenCalledTimes(1);
    expect(connection.onError).not.toHaveBeenCalled();
  });

  it('reconnects when the browser closes the connection', async () => {
    await using context = createSchemaContext();
    using connection = startConnection(context.schema.name, [
      createMigration('first'),
    ]);

    const original = await connection.waitForChanges(1);

    // Only a browser-initiated close fires this event, so it has to be faked.
    original?.close();
    original?.dispatchEvent(new Event('close'));

    const reconnected = await connection.waitForChanges(3);

    expect(connection.onChange.mock.calls[1]).toEqual([null]);
    expect(reconnected).toBeInstanceOf(IDBDatabase);
    expect(reconnected).not.toBe(original);
    expect(connection.onError).not.toHaveBeenCalled();
  });

  describe('when closed', () => {
    it('closes the connection and stops reconnecting', async () => {
      await using context = createSchemaContext();
      const { name } = context.schema;
      const first = createMigration('first');
      using connection = startConnection(name, [first]);

      const database = await connection.waitForChanges(1);
      connection.close();
      await deleteDatabase(name);

      expect(connection.onChange.mock.calls).toEqual([[database], [null]]);
      expect(first.run).toHaveBeenCalledTimes(1);
    });

    it('reports a single change after reconnecting', async () => {
      await using context = createSchemaContext();
      const { name } = context.schema;
      using connection = startConnection(name, [createMigration('first')]);

      await connection.waitForChanges(1);
      await deleteDatabase(name);
      await connection.waitForChanges(3);
      connection.close();

      expect(connection.onChange).toHaveBeenCalledTimes(4);
      expect(connection.onChange).toHaveBeenLastCalledWith(null);
    });

    it('closes a connection that was still opening', async () => {
      await using context = createSchemaContext();
      const { name } = context.schema;
      using connection = startConnection(name, [createMigration('first')]);

      connection.close();

      // Deleting waits for the connection to close.
      await deleteDatabase(name);

      expect(connection.onChange).not.toHaveBeenCalled();
      expect(connection.onError).not.toHaveBeenCalled();
    });

    it('ignores a failure to open', async () => {
      await using context = createSchemaContext();
      const { name } = context.schema;
      const broken = createThrowingMigration(new Error('Migration failed.'));
      using connection = startConnection(name, [broken]);

      connection.close();
      await deleteDatabase(name);

      expect(connection.onError).not.toHaveBeenCalled();
    });

    it('reports a single change when closed twice', async () => {
      await using context = createSchemaContext();
      using connection = startConnection(context.schema.name, [
        createMigration('first'),
      ]);

      await connection.waitForChanges(1);
      connection.close();
      connection.close();

      expect(connection.onChange).toHaveBeenCalledTimes(2);
    });

    it('closes from inside the change that provides the database', async () => {
      await using context = createSchemaContext();
      using connection = startConnection(context.schema.name, [
        createMigration('first'),
      ]);

      connection.onChange.mockImplementation((database) => {
        if (database) connection.close();
      });

      await expect(connection.waitForChanges(2)).resolves.toBeNull();
    });

    it('stays closed when closed from inside a lost connection', async () => {
      await using context = createSchemaContext();
      const { name } = context.schema;
      const first = createMigration('first');
      const probe = createMigration('probe');
      using connection = startConnection(name, [first]);

      connection.onChange.mockImplementation((database) => {
        if (!database) connection.close();
      });

      await connection.waitForChanges(1);
      await deleteDatabase(name);

      // Opens run in order, so a reconnect would have recreated the database
      // before this one, and the probe wouldn't run.
      (await openOrUpgrade(define(name, [probe]))).close();

      expect(probe.run).toHaveBeenCalledTimes(1);
      expect(first.run).toHaveBeenCalledTimes(1);
      expect(connection.onChange).toHaveBeenCalledTimes(2);
    });
  });
});
