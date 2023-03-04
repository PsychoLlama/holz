# `@holz/logger`

A lightweight and customizable logger for Node.js and browser environments.

## Installation

Install with [npm](https://www.npmjs.com/):

```bash
npm install @holz/logger
```

## Usage

First, import the logger:

```typescript
import logger from '@holz/logger';
```

Then, start logging! You can use any of the supported log levels (`debug`, `info`, `warn`, `error`) to write messages to the console:

```typescript
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
```

You can also add a namespace to your logs to help organize them:

```typescript
const dbLogger = logger.namespace('db');
dbLogger.info('Connected to database');
```

By default, logs are formatted with a timestamp, log level, namespace (if provided), and message:

```
2023-03-04T22:25:41.143Z INFO  [db] Connected to database
```

## Customizing the Logger

`@holz/logger` is a bundle of plugins that can be used separately to build a custom logger. The library uses several plugins, such as [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) for colorizing logs, [`@holz/stream-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-stream-backend) for writing logs to files in plain text format, and [`@holz/console-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-console-backend) for logging to the browser console.

Although the bundled logger is opinionated and not configurable, you can easily use the individual plugins to create a logger tailored to your needs. The logger's foundation is the `createLogger(backend)` function from [`@holz/core`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-core), and you can select the plugins to include based on your requirements.

For more details check out [the documentation](https://github.com/PsychoLlama/holz/blob/main/README.md) or look at [an example](https://github.com/PsychoLlama/holz/blob/main/packages/holz-logger/src/index.browser.ts).
