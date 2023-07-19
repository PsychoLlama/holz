import { createLogger } from '@holz/core';
import { createPatternFilter } from '../pattern-filter';

describe('PatternFilter', () => {
  it('only passes through logs that have the filter', () => {
    const backend = vi.fn();
    const filter = createPatternFilter({
      pattern: '-ignored, -*:wild, *',
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.namespace('ignored').info('excluded by filter');
    expect(backend).not.toHaveBeenCalled();

    logger.namespace('something').namespace('wild').info('also excluded');
    expect(backend).not.toHaveBeenCalled();

    logger.namespace('app').info('not ignored');
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'not ignored',
      }),
    );
  });

  it('does not send anything by default', () => {
    const backend = vi.fn();
    const filter = createPatternFilter({ pattern: '', processor: backend });
    const logger = createLogger(filter);

    logger.info('no include patterns mean this is ignored');

    expect(backend).not.toHaveBeenCalled();
  });
});
