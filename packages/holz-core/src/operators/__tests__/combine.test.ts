import { createLogger } from '../../logger';
import combine from '../combine';

describe('combine operator', () => {
  it('combines several log processors backends into one', () => {
    const b1 = vi.fn();
    const b2 = vi.fn();
    const backend = combine([b1, b2]);
    const logger = createLogger(backend);

    logger.info('tee message');

    expect(b1).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'tee message' })
    );

    expect(b2).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'tee message' })
    );
  });

  it('works even if you provide no logging backend', () => {
    const backend = combine([]);
    const logger = createLogger(backend);

    expect(() => logger.info('no backend')).not.toThrow();
  });
});
