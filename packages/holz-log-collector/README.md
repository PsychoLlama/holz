# `@holz/log-collector`

Supports replacing the global logging destination for all loggers in your app.

## Purpose

Let's say you're building an app, and your app uses libraries that manage logs with Holz. Your app uploads logs to a central logging backend and you want to include logs from some of those libraries. That's where `@holz/log-collector` comes in.

On startup you set a global log collector. Libraries detect this automatically and **replace** their log destination with whatever you provide. Now you control all logs and can selectively upload to your backend.

Other use cases:

- **Central Log Files:** Redirect all server logs to a file, including logs from specific libraries.
- **External Debuggers:** Depending on your environment, it may be useful to view logs in a separate application like [OTel Desktop Viewer](https://github.com/CtrlSpice/otel-desktop-viewer) or [DebugView](https://docs.microsoft.com/en-us/sysinternals/downloads/debugview). A log collector can act as the central exporter.
- **Interactive TUIs:** Renderers like [Ink](https://github.com/vadimdemedes/ink) expect control of the screen. Logs can damage rendering. A solution might redirect logs to a file stream or a custom logs window.
- **Patching Broken Logs:** If an unexpected input starts throwing errors, you have the ability to patch it without making upstream changes.

## Usage in Apps

Set a global log collector as soon as the app starts. This is typically done in the main entry file of your app.

```typescript
import { setGlobalLogCollector } from '@holz/log-collector';

setGlobalLogCollector({
  // Called for every log in your app so long as `condition` returns true.
  processor: (log) => {
    // ...
  },

  // [Optional] Decide which logs to collect. Defaults to all logs.
  condition: (log) => log.origin[0] === 'some-library',
});
```

- **processor:** Called for every log so long as `condition` returns true. The signature is a Holz plugin, which means you can pass your app's log pipeline verbatim (whatever you passed to `createLogger`).
- **condition:** A function that decides which logs to collect. By default it captures everything. If it returns `false`, logs are sent to their original destination.

---

To remove a global log collector and restore defaults, call `unsetGlobalLogCollector`:

```typescript
import { unsetGlobalLogCollector } from '@holz/log-collector';

unsetGlobalLogCollector();
```

This is primarily used in tests.

## Usage in Libraries

> [!NOTE]
> This plugin is included by default with `@holz/logger`.

This should be the **first plugin** in your log pipeline.

```typescript
import { createLogCollector } from '@holz/log-collector';
import { createLogger } from '@holz/core';

const logger = createLogger(
  createLogCollector({
    fallback: (log) => {
      // Default log backend. Called if no global log collector is set.
    },
  }),
);
```

- **fallback:** Called if no global log collector is set, or if `condition` returns false. This is the default log backend. The signature is a Holz plugin.

The expectation is the collector captures logs before any side effects happen, such as logging to the console or sending to a file.

Be aware that `logger.withMiddleware(...)` runs before the default logging backend, so take care to avoid side effects in those handlers.
