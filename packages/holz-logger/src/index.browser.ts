import { ConsoleBackend } from '@holz/console-backend';
import { createLogger } from '@holz/core';
import { EnvironmentFilter } from '@holz/env-filter';

const logger = createLogger(
  new EnvironmentFilter({ processor: new ConsoleBackend() })
);

export default logger;
