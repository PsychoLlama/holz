import { createConsoleBackend } from '@holz/console-backend';
import { createLogger } from '@holz/core';
import type { Logger } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createLogCollector } from '@holz/log-collector';

const logger: Logger = createLogger(
  createLogCollector({
    fallback: createEnvironmentFilter({
      processor: createConsoleBackend(),
      defaultPattern: '',
    }),
  }),
);

export default logger;
