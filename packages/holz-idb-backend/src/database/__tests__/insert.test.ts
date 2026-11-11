import { level } from '@holz/core';
import type { Log } from '@holz/core';

import { insert } from '../insert';
import { promisifyRequest } from '../promise';
import { openDatabaseContext } from './fixtures';
import type { DatabaseContext } from './fixtures';

const createLog = (overrides: Partial<Log> = {}): Log => ({
  timestamp: 0,
  level: level.info,
  origin: [],
  message: 'message',
  context: {},
  ...overrides,
});

const uncloneable = (message: string) =>
  createLog({
    message,
    context: { uncloneable: () => {} } as unknown as Log['context'],
  });

const readLogs = ({ database, schema }: DatabaseContext): Promise<Log[]> =>
  promisifyRequest(
    database
      .transaction(schema.table)
      .objectStore(schema.table)
      .getAll() as IDBRequest<Log[]>,
  );

const save = (
  { database, schema }: DatabaseContext,
  logs: Log[],
  retain = Infinity,
) => insert(database, logs, { db: schema, retain });

describe('insert', () => {
  it('writes every log in order', async () => {
    await using context = await openDatabaseContext();
    const logs = [createLog({ message: 'a' }), createLog({ message: 'b' })];

    await save(context, logs);

    await expect(readLogs(context)).resolves.toEqual(logs);
  });

  it('resolves for an empty batch', async () => {
    await using context = await openDatabaseContext();

    await save(context, []);

    await expect(readLogs(context)).resolves.toEqual([]);
  });

  it('discards the oldest logs beyond the retain limit', async () => {
    await using context = await openDatabaseContext();
    const logs = ['a', 'b', 'c', 'd'].map((message) => createLog({ message }));

    await save(context, logs.slice(0, 2), 3);
    await save(context, logs.slice(2), 3);

    await expect(readLogs(context)).resolves.toEqual(logs.slice(1));
  });

  it('discards logs from the same batch beyond the retain limit', async () => {
    await using context = await openDatabaseContext();
    const logs = ['a', 'b', 'c'].map((message) => createLog({ message }));

    await save(context, logs, 2);

    await expect(readLogs(context)).resolves.toEqual(logs.slice(1));
  });

  it('discards every log with a retain limit of zero', async () => {
    await using context = await openDatabaseContext();

    await save(context, [createLog()], 0);

    await expect(readLogs(context)).resolves.toEqual([]);
  });

  it('saves the rest of the batch around a log it cannot save', async () => {
    await using context = await openDatabaseContext();
    const first = createLog({ message: 'first' });
    const last = createLog({ message: 'last' });

    await expect(
      save(context, [first, uncloneable('bad'), last]),
    ).rejects.toMatchObject({ name: 'DataCloneError' });

    await expect(readLogs(context)).resolves.toEqual([first, last]);
  });

  it('rejects with every failure when there are several', async () => {
    await using context = await openDatabaseContext();
    const result = save(context, [uncloneable('a'), uncloneable('b')]);

    await expect(result).rejects.toBeInstanceOf(AggregateError);
    await expect(result).rejects.toMatchObject({
      errors: [
        expect.objectContaining({ name: 'DataCloneError' }),
        expect.objectContaining({ name: 'DataCloneError' }),
      ],
    });
  });

  it('rejects when the table does not exist', async () => {
    await using context = await openDatabaseContext();

    await expect(
      insert(context.database, [createLog()], {
        db: { ...context.schema, table: 'missing' },
        retain: Infinity,
      }),
    ).rejects.toMatchObject({ name: 'NotFoundError' });
  });
});
