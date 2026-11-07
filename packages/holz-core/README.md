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
- `context`: A dictionary of key-value pairs that provides additional context for the log message. The values in this object must be JSON serializable, except for `error` which must be an `Error` instance.

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

Holz provides a set of off-the-shelf plugins for logging to various destinations, filtering, formatting, and more. You can also write your own plugins to suit your specific needs. These plugins can be combined into a `LogProcessor` function using the utility function `createGroup()`, allowing you to send a single log to multiple destinations.

Holz's plugin system is designed to be flexible and extensible. If none of the provided plugins meet your needs, you can easily create your own plugin and still build on plugins from the rest of the ecosystem. Check out the [`@holz/logger`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-logger) package for a bundled example of Holz's logging plugins.

## Functions (`@holz/core/functions`)

In addition to the core `Logger` class, `@holz/core` provides some utility processors that you can use to extend the functionality of your logging solution. These processors are optional and can be combined with each other or with third-party processors as needed.

### `createGroup`

Groups a set of destinations into a single processor. Logs fan out to each.

```typescript
import { createGroup } from '@holz/core/functions';
import {
  consoleBackend,
  fileBackend,
  logUploadService,
} from './custom-processors';

const logger = createLogger(
  createGroup([consoleBackend, fileBackend, logUploadService]),
);
```

### `createFilter`

Accepts a filter function. Anything returning `false` is discarded.

```typescript
import { createFilter } from '@holz/core/functions';

const debugLogFilter = createFilter(
  (log) => log.level > level.debug,
  consoleProcessor,
);

const logger = createLogger(debugLogFilter);
```

### `createValve`

Switches between buffering and streaming. Analogous to opening a valve on a hose.

#### Use Cases

- Buffer logs until a plugin finishes initializing.
- Pause uploads while offline and flush on reconnect.
- Wait to send logs until a user consents to telemetry.

#### Example

```typescript
import { createValve } from '@holz/core/functions';

const { open, close, processor } = createValve({
  // Start in buffered mode.
  open: false,

  // Buffer up to 1k logs. Beyond that, drop the oldest.
  capacity: 1_000,

  // Streaming: forward to this backend.
  processor: persist,

  // Batched: drain logs when the valve opens.
  drain: (logs) => logs.forEach(persist),
});

const logger = createLogger(processor);

// Later: drain the buffer and stream logs going forward.
open();
```

### `createRouter`

Switches between log destinations dynamically.

#### Use Cases

- Fall back to local storage when uploads fail, and switch back once they recover.
- Swap backends when changing a diagnostics setting.
- Redirect logs to a file while a TUI owns the terminal.

#### Example

```typescript
import { createRouter } from '@holz/core/functions';

const { select, processor } = createRouter(
  // Start by sending logs to stderr.
  'stderr',

  // Every possible destination, by name.
  {
    stderr: printToStderr,
    file: writeToFile,
  },
);

const logger = createLogger(processor);

// Later: send logs to the file instead of stderr.
select('file');
```

### `createBuffer`

Holds logs in a ring buffer until drained. Once `capacity` is reached, each new log overwrites the oldest.

#### Use Cases

- Hold startup logs until you know where to send them.
- Keep recent logs in memory to attach to crash reports.
- Collect logs during a test and assert on them afterward.

#### Example

```typescript
import { createBuffer } from '@holz/core/functions';

const { drain, processor } = createBuffer({
  // Buffer up to 1k logs. Beyond that, drop the oldest.
  // Defaults to `Infinity`.
  capacity: 1_000,
});

const logger = createLogger(processor);

// Later: empty the buffer and return its logs in arrival order.
const logs = drain();
```

### `createBatcher`

Groups logs into fixed-size batches and hands each full batch to a sink in one call.

#### Use Cases

- Upload logs in one request per batch instead of one per log.
- Write logs to IndexedDB or SQLite in one transaction per batch.
- Flush a partial batch before the process exits or the page unloads.

#### Example

```typescript
import { createBatcher } from '@holz/core/functions';

const { drain, clear, processor } = createBatcher({
  // Flush every 50 logs.
  size: 50,

  // Receives each batch in arrival order.
  sink: upload,
});

const logger = createLogger(processor);

// Later: flush the partial batch before exiting.
drain();
```
