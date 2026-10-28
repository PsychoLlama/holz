import { createConsoleBackend } from '@holz/console-backend';
import type { LogProcessor } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createLogCollector } from '@holz/log-collector';

export const processor: LogProcessor = createLogCollector({
  fallback: createEnvironmentFilter({
    processor: createConsoleBackend(),
    defaultPattern: '',
  }),
});
