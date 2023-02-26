import { isatty } from 'node:tty';
import { createAnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { createLogger, filter } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createStreamBackend } from '@holz/stream-backend';

const { NODE_ENV } = process.env;

const supportsAnsiColors =
  isatty(process.stderr.fd) && process.stderr.hasColors(3);

const logger = createLogger(
  filter(
    () => NODE_ENV !== 'test',
    createEnvironmentFilter({
      processor: supportsAnsiColors
        ? createAnsiTerminalBackend()
        : createStreamBackend({ stream: process.stderr }),
    })
  )
);

export default logger;
