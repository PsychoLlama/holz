# `@holz/logger`

A lightweight and customizable logger for Node.js and browser environments.

## Installation

Install with [npm](https://www.npmjs.com/):

```bash
npm install @holz/logger
```

## Usage

To use the logger, import it into your project:

```typescript
import logger from '@holz/logger';
```

After that, you can start logging messages with different log levels:

```typescript
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
```

By default, logs are formatted with a timestamp, log level, namespace (if provided), and message. You can also add a namespace to your logs to help organize them:

```typescript
const dbLogger = logger.namespace('db');
dbLogger.info('Connected to database');
```

If you don't see logs, you may need to enable them. You can do this by setting the `DEBUG` environment variable to `your-app*` or setting `localStorage.debug` to `your-app*`. For example, to enable logs in a Node.js script:

```bash
DEBUG='your-app*' node script.js
```

Holz is suitable for use in other libraries as you can enable logs when needed, without cluttering downstream application logs.

## Customizing the Logger

`@holz/logger` is a bundle of plugins that can be used separately to build a custom logger. The library uses several plugins, such as [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) for colorizing logs, [`@holz/stream-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-stream-backend) for writing logs to files in plain text format, and [`@holz/console-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-console-backend) for logging to the browser console.

Although the bundled logger is opinionated and not configurable, you can easily use the individual plugins to create a logger tailored to your needs. The logger's foundation is the `createLogger(backend)` function from [`@holz/core`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-core), and you can select the plugins to include based on your requirements.

For more details check out [the documentation](https://github.com/PsychoLlama/holz/blob/main/README.md) or look at [an example](https://github.com/PsychoLlama/holz/blob/main/packages/holz-logger/src/index.browser.ts).
