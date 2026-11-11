/**
 * The list of migrations can be extended by package consumers. They must have
 * a stable position, otherwise schemas become corrupted. The version would no
 * longer reflect applied migrations.
 *
 * Names provide a stable identifier to anchor custom steps. For example: add
 * index for a custom field, positioned after `init`. If this library ships
 * a new migration, the anchor preserves the correct version and order.
 *
 * So, names are important. Depending on how consumers insert, a type error on
 * a misspelled name could be the difference between a simple fix and database
 * corruption.
 */
export type MigrationNames = 'init';

/** One step in the schema's history. */
export interface Migration<Name extends string = string> {
  /** Stable identifier consumers can use to position their own migrations. */
  name: Name;

  /**
   * Moves the schema forward by one version. The transaction is shared by all
   * migrations via the `upgradeneeded` event.
   *
   * Note: for safety, thrown errors abort the upgrade, including uncommitted
   * migrations applied earlier in the transaction.
   */
  run: (transaction: IDBTransaction) => void;
}

/**
 * Every schema migration, oldest first. A migration's position determines its
 * version: index 0 upgrades to v1. Append only.
 */
export const getMigrations = (table: string): Migration<MigrationNames>[] => [
  {
    name: 'init',
    run: (transaction) =>
      void transaction.db.createObjectStore(table, { autoIncrement: true }),
  },
];
