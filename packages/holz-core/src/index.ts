import { createFilter, createGroup } from './functions';

/** @deprecated Use `createGroup` from `@holz/core/functions` instead. */
export const combine: typeof createGroup = createGroup;

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
