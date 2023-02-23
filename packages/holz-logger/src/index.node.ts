import { isatty } from 'node:tty';
import { AnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { createLogger, filter } from '@holz/core';
import { EnvironmentFilter } from '@holz/env-filter';
import { StreamBackend } from '@holz/stream-backend';

const { NODE_ENV } = process.env;

const supportsAnsiColors =
  isatty(process.stderr.fd) && process.stderr.hasColors(3);

const logger = createLogger(
  filter(
    () => NODE_ENV !== 'test',
    new EnvironmentFilter({
      processor: supportsAnsiColors
        ? new AnsiTerminalBackend()
        : new StreamBackend({ stream: process.stderr }),
    })
  )
);

export default logger;
