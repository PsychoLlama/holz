import { createConsoleBackend } from '@holz/console-backend';
import { createLogger } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';

const logger = createLogger(
  createEnvironmentFilter({ processor: createConsoleBackend() })
);

export default logger;
