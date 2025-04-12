import { createLogger, level } from '@holz/core';
import {
  createLogCollector,
  unsetGlobalLogCollector,
  setGlobalLogCollector,
} from '../index';

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
        message: 'test message',
        level: level.info,
        origin: [],
        context: {},
      });
    });
  });
});
