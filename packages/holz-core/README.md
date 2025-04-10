# `@holz/core`

`@holz/core` is a flexible and extensible logging library for TypeScript applications. It provides a simple but powerful interface for logging progress updates and errors with varying levels of severity.

## Usage

Here is an example of how to create a logger and use it to log a message:

```typescript
import { createLogger, type LogLevel } from '@holz/core';

const logger = createLogger((log) => {
  console.log(logLevelPrefix[log.level], log.message);
});

const logLevelPrefix: Record<LogLevel, string> = {
  [level.trace]: '[trace]',
  [level.debug]: '[debug]',
  [level.info]: '[info]',
  [level.warn]: '[warn]',
  [level.error]: '[error]',
  [level.fatal]: '[fatal]',
};

logger.info('Hello, world!');
```

This will log a message to the console.

```
[info] Hello, world!
```

This is a simplified example of what `@holz/console-backend` does under the hood.

## Logger Interface

The `Logger` class is the core of the library. It provides a set of methods for logging messages with different levels of severity. Each method takes a message and an optional context object.

You can also use the `namespace` method to create a new logger with a specific owner, such as a class or module. This makes it easier to identify the origin of log messages.

## Log Levels

The library provides six log levels:

- `level.fatal`: Something critical failed and we can't recover.
- `level.error`: Something failed, but we can recover.
- `level.warn`: Something is concerning, but we can keep going.
- `level.info`: High-level progress updates.
- `level.debug`: Low-level progress updates, such as events (usually hidden).
- `level.trace`: Extremely verbose updates, such as function calls and branch conditions (usually hidden).

Backends may do different things depending on severity, such as only uploading `info` or above to a log aggregator.

Each level is a number. Higher numbers mean higher severity.

## Log Structure

Every log message processed by Holz follows a specific structure defined by the `Log` interface. Understanding this structure is crucial for effective logging and log processing.

A `Log` object contains the following properties:

- `message`: The verbatim log message. This property should not contain any interpolated data.
- `level`: The severity of the log message, expressed as a member of the `LogLevel` enum. The available log levels are, in increasing order of severity: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.
- `origin`: The source of the log message. This property is an array of strings that typically identifies the library, module, or component that generated the log message, followed by more specific information. This property can be used to filter and group log messages based on their origin.
- `context`: A dictionary of key-value pairs that provides additional context for the log message. The values in this object must be JSON serializable. Because it's easy to accidentally include unsuitable log context, such as PII or deeply nested objects, the use of nested objects in the context is discouraged.

Here is an example of a log message expressed as a `Log` object:

```typescript
{
  message: 'Established database connection',
  level: level.info,
  origin: ['my-app', 'db'],
  context: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    database: 'my_database',
  },
};
```

In this example, the log message describes a successful connection to a database, with additional context about the database host, port, user, and name.

## Log Processors

In Holz, a `LogProcessor` function is responsible for processing log messages. The `createLogger` function takes this function as an argument. A `LogProcessor` is a plain function that takes a `Log` object, which contains the message, level, origin, and context of the log.

Holz provides a set of off-the-shelf plugins for logging to various destinations, filtering, formatting, and more. You can also write your own plugins to suit your specific needs. These plugins can be combined into a `LogProcessor` function using the utility function `combine()`, allowing you to send a single log to multiple destinations.

Holz's plugin system is designed to be flexible and extensible. If none of the provided plugins meet your needs, you can easily create your own plugin and still build on plugins from the rest of the ecosystem. Check out the [`@holz/logger`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-logger) package for a bundled example of Holz's logging plugins.

## Utilities

In addition to the core `Logger` class, `@holz/core` provides some utility processors that you can use to extend the functionality of your logging solution. These processors are optional and can be combined with each other or with third-party processors as needed.

### `combine`

The `combine` processor takes an array of log processors and returns a single log processor that forwards each log to all of the input processors. This is useful when you want to send a single log to multiple log destinations.

```typescript
import { combine } from '@holz/core';
import {
  consoleBackend,
  fileBackend,
  logUploadService,
} from './custom-processors';

const logger = createLogger(
  combine([consoleBackend, fileBackend, logUploadService]),
);
```

### `filter`

The `filter` processor takes a filter function and another log processor as input. If the filter function returns `true` for a log, it is forwarded to the second processor. If the filter function returns `false`, the log is discarded. This is useful when you want to selectively forward logs based on some criteria.

```typescript
import { filter } from '@holz/core';

const debugLogFilter = filter(
  (log) => log.level > level.debug,
  consoleProcessor,
);

const logger = createLogger(debugLogFilter);
```

Note that you can chain multiple filter processors together to create more complex filters.
