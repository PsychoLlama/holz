import { createLogger } from '@holz/core';
import { createEnvironmentFilter } from '../environment-filter';

vi.mock('../browser-env');
vi.mock('../server-env');

describe('EnvironmentFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the given pattern as an override', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
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
      })
    );
  });

  it('uses the fallback pattern if none exist in the environment', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      pattern: undefined,
      defaultPattern: '*, -ignored',
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.namespace('ignored').info('excluded by filter');
    expect(backend).not.toHaveBeenCalled();

    logger.info('not ignored');
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'not ignored' })
    );
  });

  it('prints everything by default', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      pattern: undefined,
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.info('not excluded');
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'not excluded' })
    );
  });

  it.skip('can change the pattern on the fly', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      pattern: '',
      processor: backend,
    });

    const logger = createLogger(filter);

    logger.info('all logs excluded');
    expect(backend).not.toHaveBeenCalled();

    // TODO: This API was removed during the functional refactor.
    // Find an equivalent way to express it.
    (filter as any).setPattern('*');
    logger.info('all logs printed');
    expect(backend).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'all logs printed' })
    );
  });

  it.skip('can retrieve the current pattern', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      pattern: undefined,
      defaultPattern: '*, -ignored',
      processor: backend,
    });

    // TODO: This API was removed during the functional refactor.
    // Find an equivalent way to express it.
    expect((filter as any).getPattern()).toBe('*, -ignored');
  });
});
