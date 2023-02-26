import { createLogger } from '../../logger';
import { LogLevel } from '../../types';
import filter from '../filter';

describe('filter operator', () => {
  it('filters out logs that do not match the predicate', () => {
    const backend = vi.fn();
    const logger = createLogger(
      filter((log) => log.level !== LogLevel.Debug, backend)
    );

    logger.info('keep me');
    logger.debug('discard');

    expect(backend).toHaveBeenCalledOnce();
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'keep me' })
    );
  });
});
