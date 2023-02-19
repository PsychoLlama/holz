import TestBackend from '../../backends/test';
import { createLogger } from '../../logger';
import { LogLevel } from '../../types';
import filter from '../filter';

describe('filter operator', () => {
  it('filters out logs that do not match the predicate', () => {
    const backend = new TestBackend();
    const logger = createLogger(
      filter((log) => log.level !== LogLevel.Debug, backend)
    );

    logger.info('keep me');
    logger.debug('discard');

    expect(backend.processLog).toHaveBeenCalledOnce();
    expect(backend.processLog).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'keep me' })
    );
  });
});
