import { Writable } from 'node:stream';
import { createLogger } from '@holz/core';
import { createJsonBackend } from '../json-backend';

const CURRENT_TIME = new Date('2020-06-15T12:00:00.000Z');

describe('JSON backend', () => {
  const createStream = () => {
    let output = '';
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        output += String(chunk);
        callback();
      },
    });

    return {
      getOutput: () => output,
      stream,
    };
  };

  beforeEach(() => {
    vi.useFakeTimers({
      now: CURRENT_TIME,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('prints the logs to the writable stream', () => {
    const { stream, getOutput } = createStream();
    const backend = createJsonBackend({ stream });

    const logger = createLogger(backend);
    logger.debug('shout');
    logger.info('normal');
    logger.warn('hmmmm');
    logger.error('oh no');

    expect(getOutput()).toMatchSnapshot();
  });
});
