import { createLogger } from '../../logger';
import { level } from '../../types';
import { createFilter } from '../filter';

describe('createFilter', () => {
  it('filters out logs that do not match the predicate', () => {
    const backend = vi.fn();
    const logger = createLogger(
      createFilter((log) => log.level !== level.debug, backend),
    );

    logger.info('keep me');
    logger.debug('discard');

    expect(backend).toHaveBeenCalledOnce();
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'keep me' }),
    );
  });
});
