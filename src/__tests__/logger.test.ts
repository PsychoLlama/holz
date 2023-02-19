import { createLogger } from '../logger';
import { LogLevel, LogProcessor } from '../types';

class TestBackend implements LogProcessor {
  processLog = vi.fn();
}

describe('Logger', () => {
  it('sends structured logs to the log processor', () => {
    const backend = new TestBackend();
    const logger = createLogger(backend);

    logger.info('Hello world', { audience: 'testers' });

    expect(backend.processLog).toHaveBeenCalledOnce();
    expect(backend.processLog).toHaveBeenCalledWith({
      message: 'Hello world',
      level: 'info',
      origin: [],
      context: { audience: 'testers' },
    });
  });

  it.each([
    [LogLevel.Debug, 'Look, a dead fly', { urgency: 'high' }],
    [LogLevel.Info, 'I am not a window cleaner!', { state: 'panic' }],
    [LogLevel.Warn, 'There are irregularities in the pension fund', {}],
    [LogLevel.Error, 'Leadership has taken a dive', { windows: 'open' }],
  ])('correctly processes %s log messages', (level, message, context) => {
    const backend = new TestBackend();
    const logger = createLogger(backend);

    logger[level](message, context);
    expect(backend.processLog).toHaveBeenCalledWith({
      message,
      level,
      context,
      origin: [],
    });
  });

  describe('namespace', () => {
    it('extends the origin of the logger', () => {
      const backend = new TestBackend();
      const logger = createLogger(backend)
        .namespace('signaling')
        .namespace('socket');

      logger.info('opening socket');

      expect(backend.processLog).toHaveBeenCalledOnce();
      expect(backend.processLog).toHaveBeenCalledWith({
        message: 'opening socket',
        level: 'info',
        origin: ['signaling', 'socket'],
        context: {},
      });
    });
  });
});
