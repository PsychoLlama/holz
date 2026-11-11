import { promisifyRequest } from './promise';

/** A thin promise wrapper over `indexedDB.deleteDatabase`. */
export const deleteDatabase = async (name: string): Promise<void> => {
  await promisifyRequest(indexedDB.deleteDatabase(name));
};
