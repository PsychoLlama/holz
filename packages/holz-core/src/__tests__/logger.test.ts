import { createLogger } from '../logger';
import { level } from '../types';

describe('Logger', () => {
  it('sends structured logs to the log processor', () => {
    const backend = vi.fn();
    const logger = createLogger(backend);

    logger.info('Hello world', { audience: 'testers' });

    expect(backend).toHaveBeenCalledOnce();
    expect(backend).toHaveBeenCalledWith({
      message: 'Hello world',
      level: 'info',
      origin: [],
      context: { audience: 'testers' },
    });
  });

  it.each([
    [level.trace, 'Look, a dead fly', { urgency: 'high?' }],
    [level.debug, 'Made in Britain', { condition: 'fire' }],
    [level.info, 'I am not a window cleaner!', { state: 'panic' }],
    [level.warn, 'There are irregularities in the pension fund', {}],
    [level.error, 'Have you tried turning it off and on again?', {}],
    [level.fatal, 'Leadership has taken a dive', { windows: 'open' }],
  ])('correctly processes %s log messages', (level, message, context) => {
    const backend = vi.fn();
    const logger = createLogger(backend);

    logger[level](message, context);
    expect(backend).toHaveBeenCalledWith({
      message,
      level,
      context,
      origin: [],
    });
  });

  it('binds the log methods to the logger', () => {
    const backend = vi.fn();
    const logger = createLogger(backend);

    const { debug, info, warn, error } = logger;
    debug('Debugging message');
    info('Informative message');
    warn('Warning message');
    error('Error message');

    expect(backend).toHaveBeenCalledTimes(4);
  });

  describe('namespace', () => {
    it('extends the origin of the logger', () => {
      const backend = vi.fn();
      const logger = createLogger(backend)
        .namespace('signaling')
        .namespace('socket');

      logger.info('opening socket');

      expect(backend).toHaveBeenCalledOnce();
      expect(backend).toHaveBeenCalledWith({
        message: 'opening socket',
        level: 'info',
        origin: ['signaling', 'socket'],
        context: {},
      });
    });
  });
});
