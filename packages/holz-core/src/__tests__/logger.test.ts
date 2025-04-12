import { createLogger } from '../logger';
import { level } from '../index';

const SYSTEM_TIME = new Date('2020-06-15T12:30:00Z').getTime();

vi.setSystemTime(SYSTEM_TIME);

describe('Logger', () => {
  it('sends structured logs to the log processor', () => {
    const backend = vi.fn();
    const logger = createLogger(backend);

    logger.info('Hello world', { audience: 'testers' });

    expect(backend).toHaveBeenCalledOnce();
    expect(backend).toHaveBeenCalledWith({
      timestamp: SYSTEM_TIME,
      message: 'Hello world',
      level: level.info,
      origin: [],
      context: { audience: 'testers' },
    });
  });

  it.each([
    ['trace' as const, 'Look, a dead fly', { urgency: 'high?' }],
    ['debug' as const, 'Made in Britain', { condition: 'fire' }],
    ['info' as const, 'I am not a window cleaner!', { state: 'panic' }],
    ['warn' as const, 'There are irregularities in the pension fund', {}],
    ['error' as const, 'Have you tried turning it off and on again?', {}],
    ['fatal' as const, 'Leadership has taken a dive', { windows: 'open' }],
  ])('correctly processes %s log messages', (method, message, context) => {
    const backend = vi.fn();
    const logger = createLogger(backend);

    logger[method](message, context);
    expect(backend).toHaveBeenCalledWith({
      timestamp: SYSTEM_TIME,
      message,
      level: level[method],
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
        timestamp: SYSTEM_TIME,
        message: 'opening socket',
        level: level.info,
        origin: ['signaling', 'socket'],
        context: {},
      });
    });
  });

  describe('withMiddleware', () => {
    it('allows middleware to be added', () => {
      const backend = vi.fn();
      const logger = createLogger(backend).withMiddleware((next) => (log) => {
        next({ ...log, message: 'replaced' });
      });

      logger.info('original message');
      expect(backend).toHaveBeenCalledOnce();
      expect(backend).toHaveBeenCalledWith({
        timestamp: SYSTEM_TIME,
        message: 'replaced',
        level: level.info,
        origin: [],
        context: {},
      });
    });

    it('inherits middleware from parent loggers', () => {
      const backend = vi.fn();
      const logger = createLogger(backend)
        .withMiddleware((next) => (log) => {
          log.context.parent = true;
          next(log);
        })
        .namespace('child')
        .withMiddleware((next) => (log) => {
          log.context.child = true;
          next(log);
        });

      logger.info('original message');
      expect(backend).toHaveBeenCalledOnce();
      expect(backend).toHaveBeenCalledWith({
        timestamp: SYSTEM_TIME,
        message: 'original message',
        level: level.info,
        origin: ['child'],
        context: { parent: true, child: true },
      });
    });
  });
});
