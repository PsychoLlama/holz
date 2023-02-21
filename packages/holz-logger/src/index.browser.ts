import { ConsoleBackend } from '@holz/console-backend';
import { createLogger } from '@holz/core';

const logger = createLogger(new ConsoleBackend());

export default logger;
