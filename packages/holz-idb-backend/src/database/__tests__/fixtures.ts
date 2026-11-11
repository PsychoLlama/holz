import { defineDatabase } from '../define-database';
import type { DatabaseDefinition } from '../define-database';
import { openOrUpgrade } from '../open';
import { deleteDatabase } from '../delete-database';

/** A unique schema whose database is removed on disposal, if it exists. */
export interface SchemaContext extends AsyncDisposable {
  schema: DatabaseDefinition;
}

/** A {@link SchemaContext} with an open connection, closed on disposal. */
export interface DatabaseContext extends SchemaContext {
  database: IDBDatabase;
}

/** Isolate a test from other databases. Use with `await using`. */
export const createSchemaContext = (): SchemaContext => {
  const schema = defineDatabase(`test-${crypto.randomUUID()}`, 'test-table');

  return {
    schema,
    [Symbol.asyncDispose]: () => deleteDatabase(schema.name),
  };
};

/** Create a {@link SchemaContext} and open its fully migrated database. */
export const openDatabaseContext = async (): Promise<DatabaseContext> => {
  const context = createSchemaContext();
  const database = await openOrUpgrade(context.schema);

  return {
    ...context,
    database,
    [Symbol.asyncDispose]: async () => {
      database.close();
      await context[Symbol.asyncDispose]();
    },
  };
};
