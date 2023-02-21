import { AnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { createLogger } from '@holz/core';

const logger = createLogger(new AnsiTerminalBackend());

export default logger;
