import { createLogger } from '@holz/core';
import { createEnvironmentFilter } from '../environment-filter';
import { getLocalStorageKey, getEnvironmentVariable } from '../get-env';

vi.mock('../get-env');

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

  it('allows you to choose a different localStorage key', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      processor: backend,
      localStorageKey: 'override',
    });

    const logger = createLogger(filter);
    logger.info('just print something');

    expect(getLocalStorageKey).toHaveBeenCalledWith('override');
  });

  it('allows you to choose a different environment variable', () => {
    const backend = vi.fn();
    const filter = createEnvironmentFilter({
      processor: backend,
      environmentVariable: 'OVERRIDE',
    });

    const logger = createLogger(filter);
    logger.info('just print something');

    expect(getEnvironmentVariable).toHaveBeenCalledWith('OVERRIDE');
  });
});
