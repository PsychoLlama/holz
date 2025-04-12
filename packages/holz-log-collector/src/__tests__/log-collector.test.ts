import { createLogger, level } from '@holz/core';
import {
  createLogCollector,
  unsetGlobalLogCollector,
  setGlobalLogCollector,
} from '../index';

const CURRENT_TIME = new Date('2010-10-01T00:00:00Z').getTime();

vi.setSystemTime(CURRENT_TIME);

describe('log collector', () => {
  afterEach(() => {
    unsetGlobalLogCollector();
  });

  describe('createLogInterceptor', () => {
    it('sends logs to the default backend', () => {
      const fallback = vi.fn();
      const logger = createLogger(createLogCollector({ fallback }));

      logger.info('test message');
      expect(fallback).toHaveBeenCalledOnce();
      expect(fallback).toHaveBeenCalledWith({
        timestamp: CURRENT_TIME,
        message: 'test message',
        level: level.info,
        origin: [],
        context: {},
      });
    });

    it('sends logs to the interceptor if defined', () => {
      const interceptor = vi.fn();
      const fallback = vi.fn();
      const logger = createLogger(createLogCollector({ fallback }));

      setGlobalLogCollector({
        processor: interceptor,
      });

      logger.info('test message');
      expect(fallback).not.toHaveBeenCalled();
      expect(interceptor).toHaveBeenCalledOnce();
      expect(interceptor).toHaveBeenCalledWith({
        timestamp: CURRENT_TIME,
        message: 'test message',
        level: level.info,
        origin: [],
        context: {},
      });
    });

    it('uses the default backend if the interceptor does not match', () => {
      const interceptor = vi.fn();
      const fallback = vi.fn();
      const logger = createLogger(createLogCollector({ fallback }));

      setGlobalLogCollector({
        processor: interceptor,
        condition: () => false,
      });

      logger.info('test message');
      expect(interceptor).not.toHaveBeenCalled();
      expect(fallback).toHaveBeenCalledOnce();
      expect(fallback).toHaveBeenCalledWith({
        timestamp: CURRENT_TIME,
        message: 'test message',
        level: level.info,
        origin: [],
        context: {},
      });
    });
  });
});
