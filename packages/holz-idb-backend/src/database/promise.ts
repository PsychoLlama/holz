/** Resolves with the request's result, or rejects with its error. */
export const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> => {
  const { promise, resolve, reject } = Promise.withResolvers<T>();

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => {
    const error =
      request.error ??
      new Error('IndexedDB request failed.', { cause: request });

    reject(error);
  };

  return promise;
};

/** Resolves once the transaction commits, or rejects if it aborts. */
export const promisifyTransaction = (
  transaction: IDBTransaction,
): Promise<void> => {
  const { promise, resolve, reject } = Promise.withResolvers<void>();

  transaction.oncomplete = () => resolve();

  // Every failure ends here, including requests that fail and writes that
  // exceed the storage quota at commit.
  transaction.onabort = () => {
    const error =
      transaction.error ??
      new Error('IndexedDB transaction aborted.', { cause: transaction });

    reject(error);
  };

  return promise;
};
