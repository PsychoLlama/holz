import { createLogger } from '../../logger';
import { createGroup } from '../group';

describe('createGroup', () => {
  it('groups several log processors into one', () => {
    const b1 = vi.fn();
    const b2 = vi.fn();
    const backend = createGroup([b1, b2]);
    const logger = createLogger(backend);

    logger.info('tee message');

    expect(b1).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'tee message' }),
    );

    expect(b2).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'tee message' }),
    );
  });

  it('works even if you provide no logging backend', () => {
    const backend = createGroup([]);
    const logger = createLogger(backend);

    expect(() => logger.info('no backend')).not.toThrow();
  });
});
