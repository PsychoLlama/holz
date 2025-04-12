import {
  level,
  type LogContext,
  type LogLevel,
  type LogProcessor,
  type StrictContext,
  type Logger,
} from './types';

const createNamespacedLogger = (
  processor: LogProcessor,
  namespace: ReadonlyArray<string>,
): Logger => {
  const createAndSendLog = <Context extends StrictContext<Context>>(
    level: LogLevel,
    message: string,
    context: Context = {} as Context,
  ) => {
    processor({
      message,
      level,
      origin: namespace,
      context: context as LogContext,
    });
  };

  const logger: Logger = {
    owner: namespace,
    trace: createAndSendLog.bind(null, level.trace),
    debug: createAndSendLog.bind(null, level.debug),
    info: createAndSendLog.bind(null, level.info),
    warn: createAndSendLog.bind(null, level.warn),
    error: createAndSendLog.bind(null, level.error),
    fatal: createAndSendLog.bind(null, level.fatal),
    namespace: (child: string) =>
      createNamespacedLogger(processor, namespace.concat(child)),
  };

  // Non-enumerable to keep the repl clean.
  const hidden = { configurable: false, enumerable: false };
  return Object.defineProperties(logger, {
    namespace: hidden,
    trace: hidden,
    debug: hidden,
    info: hidden,
    warn: hidden,
    error: hidden,
    fatal: hidden,
  });
};

/**
 * Create a new logger. The processor is up to you. There are plugins for
 * filtering, formatting, combining multiple processors together, and more.
 *
 * If you wish to use more than one processor, `combine(...)` them first.
 */
export const createLogger = (processor: LogProcessor): Logger =>
  createNamespacedLogger(processor, []);
