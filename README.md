<div align="center">
  <h1>Holz</h1>
  <p>Unix-style plugins composing pipelines over structured logs.</p>
</div>

## Purpose

Logging is personal. Every app has unique requirements, but they all do a mix of the same things. Frameworks bloat trying to handle every case.

Holz takes a different approach. The core interface produces structured data without opinions on where it goes:

```typescript
logger.info('Sending new user email', { userId: user.id });
```

```typescript
{
  timestamp: 1199145600000,
  message: 'Sending new user email',
  level: level.info,
  origin: ['UserService'],
  context: { userId: '465ebaec-2b53-4b81-95e9-9f35771c0af2' },
}
```

Logs are passed to one or more plugins: functions that take a log and decide what to do with it. They filter, transform, serialize, batch, or upload.

Holz aims to be **tiny**. Plugins are aggressively optimized for bundle size.

## Usage

If you don't want to bother with plugins, `@holz/logger` is an opinionated package with batteries included.

```typescript
import logger from '@holz/logger';

logger.info('Hello, world!');
```

It works in both Node and the browser.

By default, logs are hidden. To enable them, set the `DEBUG` environment variable to the namespace(s) you want to see logs for:

```bash
DEBUG='your-app*' node script.js
```

Alternatively, you can enable logs by setting the `localStorage.debug` property:

```typescript
localStorage.debug = 'your-app*';
```

For more details, read [the documentation](https://github.com/PsychoLlama/holz/tree/main/packages/holz-logger).

## Plugins

Everything in Holz is a plugin. Plugins are functions that take a log and do something with it:

```typescript
import { createLogger, type LogProcessor } from '@holz/core';

const createPlugin: LogProcessor = () => {
  return (log) => {
    // Print it, save it to a file, pass it to another plugin.
    // This is up to you.
  };
};

const logger = createLogger(createPlugin());
```

Holz has a number of plugins already available. See each package for documentation:

| Plugin                                                                                                             | Description                                      |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [`@holz/core`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-core)                                   | Core framework. Includes tools and types.        |
| [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) | Pretty-print logs to the terminal.               |
| [`@holz/console-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-console-backend)             | Pretty-print logs to the browser console.        |
| [`@holz/json-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-json-backend)                   | Write logs as NDJSON to a writable stream.       |
| [`@holz/stream-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-stream-backend)               | Send plaintext logs to a writable stream.        |
| [`@holz/pattern-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-pattern-filter)               | Filter logs against a pattern.                   |
| [`@holz/env-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-env-filter)                       | Pull filters from `env.DEBUG` or `localStorage`. |
| [`@holz/log-collector`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-log-collector)                 | Manage a global log destination.                 |

## Recipes

### Multiple Logging Destinations

Holz supports forking to different log destinations by using the `combine(...)` utility:

```typescript
import { createLogger, combine } from '@holz/core';

const logger = createLogger(
  combine([
    createConsoleBackend(),
    createFileBackend('./my-app.log'),
    createUploadBackend({ apiKey: config.apiKey }),
  ]),
);
```

### Filtering Debug Logs

```typescript
import { createLogger, filter, level } from '@holz/core';

const logger = createLogger(
  filter(
    (log) => log.level >= level.info,
    createStreamBackend({ stream: process.stderr }),
  ),
);
```

### Filtering Logs Before Uploading

```typescript
import { createLogger, combine, filter } from '@holz/core';

const logger = createLogger(
  combine([
    createStreamBackend({ stream: process.stderr }),
    filter(
      (log) => log.origin[0] === 'my-app',
      createUploadBackend({ key: config.uploadKey }),
    ),
  ]),
);
```

## Related Projects

Holz is inspired by other loggers:

- [pino](https://getpino.io/)
- [debug](https://github.com/debug-js/debug)
- [winston](https://github.com/winstonjs/winston)
- [tslog](https://github.com/fullstack-build/tslog)

## Name

It's a play on the word "logger":

> Holz (German, noun): a piece of wood, usually small.

There is another library named [`holz`](https://www.npmjs.com/package/holz) (without the org scope). It is not related.
