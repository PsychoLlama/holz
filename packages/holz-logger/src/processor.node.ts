import { createAnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import { filter } from '@holz/core';
import type { LogProcessor } from '@holz/core';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createStreamBackend } from '@holz/stream-backend';
import { createLogCollector } from '@holz/log-collector';

const { NODE_ENV } = process.env;

const supportsAnsiColors =
  process.stderr.isTTY && process.stderr.getColorDepth() > 1;

export const processor: LogProcessor = createLogCollector({
  fallback: filter(
    () => NODE_ENV !== 'test',
    createEnvironmentFilter({
      defaultPattern: '',
      processor: supportsAnsiColors
        ? createAnsiTerminalBackend()
        : createStreamBackend({ stream: process.stderr }),
    }),
  ),
});
