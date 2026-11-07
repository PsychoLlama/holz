import { combine as combineFn, createFilter } from './functions';

/** @deprecated Import from `@holz/core/functions` instead. */
export const combine: typeof combineFn = combineFn;

/** @deprecated Use `createFilter` from `@holz/core/functions` instead. */
export const filter: typeof createFilter = createFilter;

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
