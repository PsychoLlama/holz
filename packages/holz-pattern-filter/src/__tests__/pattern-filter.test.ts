import type { LogProcessor } from '@holz/core';
import { createLogger } from '@holz/core';
import PatternFilter from '../pattern-filter';

class TestBackend implements LogProcessor {
  processLog = vi.fn();
}

describe('PatternFilter', () => {
  it('only passes through logs that have the filter', () => {
    const backend = new TestBackend();
    const filter = new PatternFilter('-ignored, -*:wild, *', backend);
    const logger = createLogger(filter);

    logger.namespace('ignored').info('excluded by filter');
    expect(backend.processLog).not.toHaveBeenCalled();

    logger.namespace('something').namespace('wild').info('also excluded');
    expect(backend.processLog).not.toHaveBeenCalled();

    logger.namespace('app').info('not ignored');
    expect(backend.processLog).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'not ignored',
      })
    );
  });

  it('does not send anything by default', () => {
    const backend = new TestBackend();
    const filter = new PatternFilter('', backend);
    const logger = createLogger(filter);

    logger.info('no include patterns mean this is ignored');

    expect(backend.processLog).not.toHaveBeenCalled();
  });
});
