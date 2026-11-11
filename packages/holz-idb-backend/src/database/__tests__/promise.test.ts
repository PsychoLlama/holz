import { promisifyRequest, promisifyTransaction } from '../promise';
import { openDatabaseContext } from './fixtures';

describe('promisifyRequest', () => {
  it('resolves with the result of the request', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;
    const store = database
      .transaction(schema.table, 'readwrite')
      .objectStore(schema.table);

    store.add('value', 'key');

    await expect(promisifyRequest(store.get('key'))).resolves.toBe('value');
  });

  it('rejects with the error of the request', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;
    const store = database
      .transaction(schema.table, 'readwrite')
      .objectStore(schema.table);

    store.add('value', 'key');

    await expect(
      promisifyRequest(store.add('duplicate', 'key')),
    ).rejects.toMatchObject({ name: 'ConstraintError' });
  });

  it('rejects with a fallback when the request has no error', async () => {
    const request = { error: null } as IDBRequest;
    const result = promisifyRequest(request);

    request.onerror?.(new Event('error'));

    await expect(result).rejects.toMatchObject({
      message: 'IndexedDB request failed.',
      cause: request,
    });
  });
});

describe('promisifyTransaction', () => {
  it('resolves once the transaction commits', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;
    const transaction = database.transaction(schema.table, 'readwrite');

    transaction.objectStore(schema.table).add('value', 'key');

    await expect(promisifyTransaction(transaction)).resolves.toBeUndefined();
  });

  it('rejects with the error that aborted the transaction', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;
    const transaction = database.transaction(schema.table, 'readwrite');
    const store = transaction.objectStore(schema.table);

    store.add('value', 'key');
    store.add('duplicate', 'key');

    await expect(promisifyTransaction(transaction)).rejects.toMatchObject({
      name: 'ConstraintError',
    });
  });

  it('rejects with a fallback when aborted without an error', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;
    const transaction = database.transaction(schema.table, 'readwrite');
    const result = promisifyTransaction(transaction);

    transaction.abort();

    await expect(result).rejects.toMatchObject({
      message: 'IndexedDB transaction aborted.',
      cause: transaction,
    });
  });
});
