<div align="center">
  <h1>Holz</h1>
  <p>A structured, composable logging framework.</p>
</div>

## Purpose

Most logging frameworks are destructive. The act of converting logs to strings partially destroys the data it contains. Instead, Holz encourages pipelines of structured data:

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

Each log is sent through a chain of plugins that choose how to filter, transform, serialize, or upload them.

## Usage

Holz is built on a chain of plugins, but if you want something that Just Works, use the preconfigured bundle:

```typescript
import logger from '@holz/logger';

logger.info('Hello, world!');
```

That's it! You can use Holz in Node or in the browser.

By default, logs are hidden. To enable them, set the `DEBUG` environment variable to the namespace(s) you want to see logs for:

```bash
DEBUG='your-app*' node script.js
```

Alternatively, you can enable logs by setting the `localStorage.debug` property:

```typescript
localStorage.debug = 'your-app*';
```

For more details, check [the documentation](https://github.com/PsychoLlama/holz/tree/main/packages/holz-logger).

## Rules

To keep logs consistent and useful, the API is designed to follow these two rules:

1. **Don't Interpolate:** Never interpolate data into your log messages. Instead, pass variables as structured data. This makes it easier to search, analyze, and visualize your logs.
2. **Keep Context Shallow:** While the `log.context` property provides additional context for your log messages, we don't allow nested objects in it. This is to prevent the accidental inclusion of unsuitable log context, like sensitive user data or redux state.

By following these rules, we make sure our logs are well-organized and useful, without compromising on the privacy and security of our users.

## Customizing the Logger

Almost everything in Holz is a plugin. Plugins are functions that take a log and do something with it:

```typescript
import { createLogger } from '@holz/core';

const plugin = (log: Log) => {
  // Print it, save it to a file, pass it to another plugin...
  // This is up to you.
};

const logger = createLogger(plugin);
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

Holz supports forking to different log destinations by using the `combine(...)` operator:

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
