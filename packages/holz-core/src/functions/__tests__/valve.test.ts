import { createLogger } from '../../logger';
import type { Log, LogProcessor } from '../../types';
import { createValve } from '../valve';

/**
 * Wire a valve to a recording processor and drain behind a real logger. Both
 * record into one stream so assertions read arrival order regardless of which
 * path delivered a log.
 */
const setup = ({ capacity, open }: { capacity?: number; open: boolean }) => {
  const forwarded: string[] = [];
  const processor: LogProcessor = (log) => void forwarded.push(log.message);
  const drain = (logs: Log[]) => {
    for (const log of logs) forwarded.push(log.message);
  };

  const valve = createValve({ capacity, open, processor, drain });
  const logger = createLogger(valve.processor);

  return { forwarded, logger, ...valve };
};

describe('createValve', () => {
  it('streams logs straight through while open', () => {
    const { forwarded, logger } = setup({ open: true });

    logger.info('a');
    logger.info('b');

    expect(forwarded).toEqual(['a', 'b']);
  });

  it('starts closed when told, buffering until the first open', () => {
    const { forwarded, logger, open } = setup({ open: false });

    logger.info('a');
    logger.info('b');
    expect(forwarded).toEqual([]);

    open();
    expect(forwarded).toEqual(['a', 'b']);
  });

  it('flushes held logs in arrival order on open, then streams', () => {
    const { forwarded, logger, open, close } = setup({ open: true });

    close();
    logger.info('a');
    logger.info('b');
    expect(forwarded).toEqual([]);

    open();
    logger.info('c');
    expect(forwarded).toEqual(['a', 'b', 'c']);
  });

  it('releases the buffer as a single batch', () => {
    const batches: string[][] = [];
    const { processor, open } = createValve({
      open: false,
      processor: () => {},
      drain: (logs) => void batches.push(logs.map((log) => log.message)),
    });
    const logger = createLogger(processor);

    logger.info('a');
    logger.info('b');
    open();

    expect(batches).toEqual([['a', 'b']]);
  });

  it('skips the drain when nothing was buffered', () => {
    const drain = vi.fn();
    const { open, close } = createValve({
      open: false,
      processor: () => {},
      drain,
    });

    open();
    close();
    open();

    expect(drain).not.toHaveBeenCalled();
  });

  it('drops the oldest logs once the buffer is full', () => {
    const { forwarded, logger, open } = setup({ capacity: 2, open: false });

    for (const message of ['a', 'b', 'c', 'd']) {
      logger.info(message);
    }
    open();

    expect(forwarded).toEqual(['c', 'd']);
  });

  it('streams a re-entrant log cleanly during a flush', () => {
    const forwarded: string[] = [];

    // Reads `logger` only when invoked, by which point the `const` is set.
    let reentered = false;
    const drain = (logs: Log[]) => {
      for (const log of logs) {
        forwarded.push(log.message);
        if (log.message === 'b' && !reentered) {
          reentered = true;
          logger.info('reentrant');
        }
      }
    };

    const valve = createValve({
      open: false,
      processor: (log) => void forwarded.push(log.message),
      drain,
    });
    const logger = createLogger(valve.processor);

    logger.info('a');
    logger.info('b');
    logger.info('c');
    valve.open();

    expect(forwarded).toEqual(['a', 'b', 'reentrant', 'c']);
  });

  it('treats redundant open/close calls as no-ops', () => {
    const { forwarded, logger, open, close } = setup({ open: true });

    open();
    logger.info('a');
    close();
    close();
    logger.info('b');

    expect(forwarded).toEqual(['a']);
  });
});
