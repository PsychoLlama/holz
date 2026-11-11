import { getMigrations } from './migrations';
import type { Migration, MigrationNames } from './migrations';

/** Where logs are persisted, and how that database's schema evolves. */
export interface DatabaseDefinition {
  /** Database name. */
  name: string;

  /** Object store logs land in. */
  table: string;

  /** Every migration, oldest first. A migration's position is its version. */
  migrations: Migration[];
}

/**
 * Customize the schema's migrations, e.g. to add your own. Receives the
 * defaults, oldest first, and returns the full list. A migration's position is
 * its version, so never reorder or remove one that has shipped.
 */
export type CustomizeMigrations = (
  defaults: Migration<MigrationNames>[],
) => Migration[];

/**
 * Define a log database: its name, the object store logs land in, and,
 * optionally, changes to its default migrations.
 */
export const defineDatabase = (
  name: string,
  table: string,
  customize: CustomizeMigrations = (defaults) => defaults,
): DatabaseDefinition => ({
  name,
  table,
  migrations: customize(getMigrations(table)),
});
