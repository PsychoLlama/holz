import { createLogger } from '../../logger';
import type { LogProcessor } from '../../types';
import { createRouter } from '../router';

/** A processor that records each log's message into `sink`. */
const recorder = (sink: string[]): LogProcessor => {
  return (log) => void sink.push(log.message);
};

describe('createRouter', () => {
  it('forwards to the initial destination', () => {
    const primary: string[] = [];
    const secondary: string[] = [];
    const { processor } = createRouter('a', {
      a: recorder(primary),
      b: recorder(secondary),
    });

    const logger = createLogger(processor);
    logger.info('first');

    expect(primary).toEqual(['first']);
    expect(secondary).toEqual([]);
  });

  it('switches destinations on select', () => {
    const primary: string[] = [];
    const secondary: string[] = [];
    const { processor, select } = createRouter('a', {
      a: recorder(primary),
      b: recorder(secondary),
    });

    const logger = createLogger(processor);
    logger.info('first');
    select('b');
    logger.info('second');
    select('a');
    logger.info('third');

    expect(primary).toEqual(['first', 'third']);
    expect(secondary).toEqual(['second']);
  });

  it('rejects unknown destination names', () => {
    const { select } = createRouter('a', { a: recorder([]) });

    // @ts-expect-error -- 'b' is not a destination.
    select('b');

    // @ts-expect-error -- prototype members are not destinations.
    select('toString');

    // @ts-expect-error -- 'b' is not a destination.
    createRouter('b', { a: recorder([]) });

    // @ts-expect-error -- prototype members are not destinations.
    createRouter('hasOwnProperty', { a: recorder([]) });
  });
});
