import { combine as combineFn, filter as filterFn } from './functions';

/** @deprecated Import from `@holz/core/functions` instead. */
export const combine: typeof combineFn = combineFn;

/** @deprecated Import from `@holz/core/functions` instead. */
export const filter: typeof filterFn = filterFn;

export { createLogger } from './logger';
export { level } from './types';
export type {
  LogProcessor,
  LogContext,
  Log,
  CustomContext,
  Logger,
  LogLevel,
} from './types';
