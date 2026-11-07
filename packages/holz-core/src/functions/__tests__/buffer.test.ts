import { createLogger } from '../../logger';
import type { Log } from '../../types';
import { createBuffer } from '../buffer';

/** Wire a buffer behind a real logger. */
const setup = (capacity: number) => {
  const { processor, drain } = createBuffer({ capacity });
  const logger = createLogger(processor);

  return { logger, drain };
};

const messages = (logs: Log[]) => logs.map((log) => log.message);

describe('createBuffer', () => {
  it('returns held logs in arrival order', () => {
    const { logger, drain } = setup(10);

    logger.info('a');
    logger.info('b');

    expect(messages(drain())).toEqual(['a', 'b']);
  });

  it('returns nothing when empty', () => {
    const { drain } = setup(10);

    expect(drain()).toEqual([]);
  });

  it('empties on drain', () => {
    const { logger, drain } = setup(10);

    logger.info('a');
    drain();
    logger.info('b');

    expect(messages(drain())).toEqual(['b']);
  });

  it('drops the oldest logs once full', () => {
    const { logger, drain } = setup(3);

    // Push past capacity so the write head wraps and overwrites the oldest.
    for (const message of ['a', 'b', 'c', 'd', 'e']) {
      logger.info(message);
    }

    expect(messages(drain())).toEqual(['c', 'd', 'e']);
  });

  it('restarts the ring after draining a wrapped buffer', () => {
    const { logger, drain } = setup(2);

    for (const message of ['a', 'b', 'c']) {
      logger.info(message);
    }
    drain();
    for (const message of ['d', 'e', 'f']) {
      logger.info(message);
    }

    expect(messages(drain())).toEqual(['e', 'f']);
  });

  it('keeps nothing when capacity is zero', () => {
    const { logger, drain } = setup(0);

    logger.info('a');

    expect(drain()).toEqual([]);
  });

  it('holds without bound at the default (Infinity) capacity', () => {
    const { processor, drain } = createBuffer();
    const logger = createLogger(processor);
    const expected = Array.from(Array(200).keys(), (index) => `log-${index}`);

    for (const message of expected) {
      logger.info(message);
    }

    expect(messages(drain())).toEqual(expected);
  });
});
