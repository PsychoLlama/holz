import { defineDatabase } from '../define-database';
import type { CustomizeMigrations } from '../define-database';
import { getMigrations } from '../migrations';

describe('defineDatabase', () => {
  it('uses the default migrations', () => {
    const db = defineDatabase('name', 'table');

    expect(db).toMatchObject({ name: 'name', table: 'table' });
    expect(db.migrations.map(({ name }) => name)).toEqual(
      getMigrations('table').map(({ name }) => name),
    );
  });

  it('builds migrations for the configured table', () => {
    const db = defineDatabase('name', 'table');
    const createObjectStore = vi.fn();

    db.migrations[0].run({
      db: { createObjectStore },
    } as unknown as IDBTransaction);

    expect(createObjectStore).toHaveBeenCalledWith('table', expect.anything());
  });

  it('customizes the default migrations', () => {
    const custom = { name: 'custom', run: () => {} };
    const customize = vi.fn<CustomizeMigrations>((defaults) => [
      ...defaults,
      custom,
    ]);

    const db = defineDatabase('name', 'table', customize);

    const [defaults] = customize.mock.calls[0];

    expect(defaults.map(({ name }) => name)).toEqual(
      getMigrations('table').map(({ name }) => name),
    );
    expect(db.migrations).toEqual([...defaults, custom]);
  });

  it('rejects unknown default migration names', () => {
    const customize: CustomizeMigrations = (defaults) => {
      // @ts-expect-error Not a migration we ship.
      defaults.findIndex((migration) => migration.name === 'intt');

      return defaults;
    };

    expectTypeOf(customize).not.toBeUndefined();
  });
});
