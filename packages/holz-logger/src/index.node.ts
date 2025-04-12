import { isatty } from 'node:tty';
import { createAnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { createLogger, filter } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createStreamBackend } from '@holz/stream-backend';
import { createLogCollector } from '@holz/log-collector';

const { NODE_ENV } = process.env;

const supportsAnsiColors =
  isatty(process.stderr.fd) && process.stderr.hasColors(3);

const logger = createLogger(
  createLogCollector({
    fallback: filter(
      () => NODE_ENV !== 'test',
      createEnvironmentFilter({
        defaultPattern: '',
        processor: supportsAnsiColors
          ? createAnsiTerminalBackend()
          : createStreamBackend({ stream: process.stderr }),
      }),
    ),
  }),
);

export default logger;
