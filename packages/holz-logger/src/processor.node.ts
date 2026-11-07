import { createAnsiTerminalBackend } from '@holz/ansi-terminal-backend';
import type { LogProcessor } from '@holz/core';
import { createFilter } from '@holz/core/functions';
import { createEnvironmentFilter } from '@holz/env-filter';
import { createStreamBackend } from '@holz/stream-backend';
import { createLogCollector } from '@holz/log-collector';

const { NODE_ENV } = process.env;

const supportsAnsiColors =
  process.stderr.isTTY && process.stderr.getColorDepth() > 1;

export const processor: LogProcessor = createLogCollector({
  fallback: createFilter(
    () => NODE_ENV !== 'test',
    createEnvironmentFilter({
      defaultPattern: '',
      processor: supportsAnsiColors
        ? createAnsiTerminalBackend()
        : createStreamBackend({ stream: process.stderr }),
    }),
  ),
});
