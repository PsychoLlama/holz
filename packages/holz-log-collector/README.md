# `@holz/log-collector`

Supports replacing the global logging destination for all loggers in your app.

## Purpose

Let's say you're building an app, and your app uses libraries that manage logs with Holz. Your app uploads logs to a central logging backend and you want to include logs from some of those libraries. That's where `@holz/log-collector` comes in.

On startup you set a global log collector. Libraries detect this automatically and **replace** their log destination with whatever you provide.

## Usage in Apps

Set a global log collector as soon as the app starts. This is typically done in the main entry file of your app.

```typescript
import { setGlobalLogCollector } from '@holz/log-collector';

setGlobalLogCollector({
  // Called for every log in your app so long as `match` returns true.
  processor: (log) => {
    // ...
  },

  // [Optional] Decide which logs to collect. Defaults to all logs.
  match: (log) => log.origin[0] === 'some-library',
});
```

- **processor:** Called for every log so long as `match` returns true. The signature is a Holz plugin, which means you can pass your app's log pipeline verbatim (whatever you passed to `createLogger`).
- **match:** A function that decides which logs to collect. By default it captures everything. If it returns `false`, logs are sent to their original destination.

## Usage in Libraries

> [!NOTE]
> This plugin is included by default with `@holz/logger`.

This should be the **first plugin** in your log pipeline.

```typescript
import { createLogInterceptor } from '@holz/log-collector';
import { createLogger } from '@holz/core';

const logger = createLogger(
  createLogInterceptor({
    fallback: (log) => {
      // Default log backend. Called if no global log collector is set.
    },
  }),
);
```

- **fallback:** Called if no global log collector is set, or if `match` returns false. This is the default log backend. The signature is a Holz plugin.

The expectation is the interceptor captures logs before any side effects happen, such as logging to the console or sending to a file.

Be aware that `logger.withMiddleware(...)` runs before the default logging backend, so take care to avoid side effects in those handlers.
