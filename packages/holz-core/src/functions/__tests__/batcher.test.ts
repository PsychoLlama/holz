import { createLogger } from '../../logger';
import type { Log } from '../../types';
import { createBatcher } from '../batcher';

/** Thrown by a test sink to simulate a failing downstream. */
class SinkError extends Error {}

/** Wire a batcher to a recording sink behind a real logger. */
const setup = (size: number) => {
  const batches: string[][] = [];
  const sink = (logs: Log[]) => {
    batches.push(logs.map((log) => log.message));
  };

  const { processor, drain, clear } = createBatcher({ size, sink });
  const logger = createLogger(processor);

  return { batches, logger, drain, clear };
};

describe('createBatcher', () => {
  it('holds logs until the batch fills', () => {
    const { batches, logger } = setup(3);

    logger.info('a');
    logger.info('b');

    expect(batches).toEqual([]);
  });

  it('flushes each full batch in arrival order', () => {
    const { batches, logger } = setup(2);

    for (const message of ['a', 'b', 'c', 'd', 'e']) {
      logger.info(message);
    }

    expect(batches).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('flushes a partial batch on drain', () => {
    const { batches, logger, drain } = setup(3);

    logger.info('a');
    drain();

    expect(batches).toEqual([['a']]);
  });

  it('skips the sink when draining an empty batch', () => {
    const { batches, drain } = setup(3);

    drain();

    expect(batches).toEqual([]);
  });

  it('discards the pending batch on clear', () => {
    const { batches, logger, drain, clear } = setup(3);

    logger.info('a');
    clear();
    logger.info('b');
    drain();

    expect(batches).toEqual([['b']]);
  });

  it('sends every log on its own at size 1', () => {
    const { batches, logger } = setup(1);

    logger.info('a');
    logger.info('b');

    expect(batches).toEqual([['a'], ['b']]);
  });

  it('starts a fresh batch when the sink throws', () => {
    const batches: string[][] = [];
    let fail = true;
    const sink = (logs: Log[]) => {
      if (fail) throw new SinkError();
      batches.push(logs.map((log) => log.message));
    };

    const { processor, drain } = createBatcher({ size: 2, sink });
    const logger = createLogger(processor);

    logger.info('a');
    expect(() => logger.info('b')).toThrow(SinkError);

    fail = false;
    logger.info('c');
    drain();

    expect(batches).toEqual([['c']]);
  });

  it('starts the next batch with logs emitted from inside the sink', () => {
    const batches: string[][] = [];

    // Reads `logger` only when invoked, by which point the `const` is set.
    const sink = (logs: Log[]) => {
      batches.push(logs.map((log) => log.message));
      if (batches.length === 1) logger.info('reentrant');
    };

    const { processor, drain } = createBatcher({ size: 2, sink });
    const logger = createLogger(processor);

    logger.info('a');
    logger.info('b');
    drain();

    expect(batches).toEqual([['a', 'b'], ['reentrant']]);
  });
});
