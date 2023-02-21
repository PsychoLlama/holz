import { AnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { createLogger } from '@holz/core';
import { EnvironmentFilter } from '@holz/env-filter';

const logger = createLogger(
  new EnvironmentFilter({
    processor: new AnsiTerminalBackend(),
  })
);

export default logger;
