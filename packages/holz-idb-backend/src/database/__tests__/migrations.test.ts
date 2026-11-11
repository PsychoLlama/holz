import { getMigrations } from '../migrations';
import { createSchemaContext, openDatabaseContext } from './fixtures';

describe('getMigrations', () => {
  it('gives every migration a unique name', async () => {
    await using context = createSchemaContext();
    const names = getMigrations(context.schema.table).map(({ name }) => name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('creates an auto-incrementing store under the configured name', async () => {
    await using context = await openDatabaseContext();
    const { database, schema } = context;

    const store = database.transaction(schema.table).objectStore(schema.table);

    expect([...database.objectStoreNames]).toEqual([schema.table]);
    expect(store.autoIncrement).toBe(true);
  });
});
