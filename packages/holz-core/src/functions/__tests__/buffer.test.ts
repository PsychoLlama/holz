import { createLogger } from '../../logger';
import type { Log } from '../../types';
import { createBuffer } from '../buffer';

/** Wire a buffer behind a real logger. */
const setup = (capacity: number) => {
  const { processor, clear } = createBuffer({ capacity });
  const logger = createLogger(processor);

  return { logger, clear };
};

const messages = (logs: Log[]) => logs.map((log) => log.message);

describe('createBuffer', () => {
  it('returns held logs in arrival order', () => {
    const { logger, clear } = setup(10);

    logger.info('a');
    logger.info('b');

    expect(messages(clear())).toEqual(['a', 'b']);
  });

  it('returns nothing when empty', () => {
    const { clear } = setup(10);

    expect(clear()).toEqual([]);
  });

  it('empties on clear', () => {
    const { logger, clear } = setup(10);

    logger.info('a');
    clear();
    logger.info('b');

    expect(messages(clear())).toEqual(['b']);
  });

  it('drops the oldest logs once full', () => {
    const { logger, clear } = setup(3);

    // Push past capacity so the write head wraps and overwrites the oldest.
    for (const message of ['a', 'b', 'c', 'd', 'e']) {
      logger.info(message);
    }

    expect(messages(clear())).toEqual(['c', 'd', 'e']);
  });

  it('restarts the ring after clearing a wrapped buffer', () => {
    const { logger, clear } = setup(2);

    for (const message of ['a', 'b', 'c']) {
      logger.info(message);
    }
    clear();
    for (const message of ['d', 'e', 'f']) {
      logger.info(message);
    }

    expect(messages(clear())).toEqual(['e', 'f']);
  });

  it('keeps nothing when capacity is zero', () => {
    const { logger, clear } = setup(0);

    logger.info('a');

    expect(clear()).toEqual([]);
  });

  it('holds without bound at the default (Infinity) capacity', () => {
    const { processor, clear } = createBuffer();
    const logger = createLogger(processor);
    const expected = Array.from(Array(200).keys(), (index) => `log-${index}`);

    for (const message of expected) {
      logger.info(message);
    }

    expect(messages(clear())).toEqual(expected);
  });
});
