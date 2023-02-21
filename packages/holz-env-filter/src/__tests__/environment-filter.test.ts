import type { LogProcessor } from '@holz/core';
import { createLogger } from '@holz/core';
import EnvironmentFilter from '../environment-filter';

class TestBackend implements LogProcessor {
  processLog = vi.fn();
}

describe('EnvironmentFilter', () => {
  it('filters against the selected pattern', () => {
    const backend = new TestBackend();
    const filter = new EnvironmentFilter({
      pattern: '-ignored, -*:wild, *',
      processor: backend,
    });

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

  it('uses the fallback pattern if the env is unset', () => {
    const backend = new TestBackend();
    const filter = new EnvironmentFilter({
      pattern: undefined,
      defaultPattern: '*, -ignored',
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.namespace('ignored').info('excluded by filter');
    expect(backend.processLog).not.toHaveBeenCalled();

    logger.info('not ignored');
    expect(backend.processLog).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'not ignored' })
    );
  });

  it('prints everything by default', () => {
    const backend = new TestBackend();
    const filter = new EnvironmentFilter({
      pattern: undefined,
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.info('not excluded');
    expect(backend.processLog).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'not excluded' })
    );
  });

  it('can change the pattern on the fly', () => {
    const backend = new TestBackend();
    const filter = new EnvironmentFilter({
      pattern: '',
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.info('all logs excluded');
    expect(backend.processLog).not.toHaveBeenCalled();

    filter.setPattern('*');
    logger.info('all logs printed');
    expect(backend.processLog).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'all logs printed' })
    );
  });

  it('can retrieve the current pattern', () => {
    const backend = new TestBackend();
    const filter = new EnvironmentFilter({
      pattern: undefined,
      defaultPattern: '*, -ignored',
      processor: backend,
    });

    expect(filter.getPattern()).toBe('*, -ignored');
  });
});
