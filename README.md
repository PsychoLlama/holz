<div align="center">
  <h1>Holz</h1>
  <p>A structured, composable logging framework.</p>
</div>

## Purpose

Most logging frameworks are destructive. The act of converting logs to strings partially destroys the data it contains. Instead, Holz uses pipelines of structured data:

```typescript
logger.info('Sending new user email', { userId: user.id });
```

```typescript
{
  message: 'Sending new user email',
  level: LogLevel.Info,
  origin: ['UserService'],
  context: { userId: '465ebaec-2b53-4b81-95e9-9f35771c0af2' },
}
```

Eventually a plugin converts it to a string, but it happens at the end of the line. Anywhere in between you can filter, transform, upload, or reroute your logs.

## Usage

Holz is built on a chain of plugins, but if you want something that Just Works, use the preconfigured bundle:

```typescript
import logger from '@holz/logger';
```

You're done! This works in Node and the browser.

### Plugins (Advanced)

Almost everything in Holz is a plugin. The design is simple, they're basically just functions:

```typescript
import { createLogger } from '@holz/core';

const plugin = {
  processLog(log) {
    // Print it, save it to a file, pass it to another plugin...
    // This is up to you.
  },
};

const logger = createLogger(plugin);
```

You don't have to start from scratch. You can mix and match with other plugins.

| Plugin                                                                                                             | Description                                      |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) | Pretty-print logs to stdout.                     |
| [`@holz/console-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-console-backend)             | Pretty-print logs to the browser console.        |
| [`@holz/core`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-core)                                   | Base logging framework.                          |
| [`@holz/env-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-env-filter)                       | Filter logs using `DEBUG` or `localStorage`.     |
| [`@holz/json-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-json-backend)                   | Send NDJSON-formatted logs to a writable stream. |
| [`@holz/logger`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-logger)                               | A pre-configured bundle of other plugins.        |
| [`@holz/pattern-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-pattern-filter)               | Filter logs using a pattern.                     |
| [`@holz/stream-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-stream-backend)               | Send plaintext logs to a writable stream.        |

## Recipes

### Multiple Logging Destinations

Holz supports piping to different log destinations by using the `combine(...)` operator:

```typescript
import { createLogger, combine } from '@holz/core';

const logger = createLogger(
  combine([new FileBackend(), new LogUploadService()])
);
```

### Filtering Debug Logs

```typescript
import { createLogger, filter, LogLevel } from '@holz/core';

const logger = createLogger(
  filter(
    (log) => log.level !== LogLevel.Debug,
    new StreamBackend({ stream: process.stdout })
  )
);
```

### Filtering Logs Before Uploading

```typescript
import { createLogger, combine, filter } from '@holz/core';

const logger = createLogger(
  combine([
    new StreamBackend({ stream: process.stdout }),
    filter(
      (log) => log.origin[0] === 'my-app',
      new UploadService({ key: config.uploadKey })
    ),
  ])
);
```
