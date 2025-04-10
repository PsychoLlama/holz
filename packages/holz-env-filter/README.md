# `@holz/env-filter`

Builds on [`@holz/pattern-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-pattern-filter) to filter logs based on your current environment, loading the pattern from `process.env.DEBUG` or `localStorage.debug`.

## Usage

```typescript
import { createEnvironmentFilter } from '@holz/env-filter';
import { createLogger } from '@holz/core';

createLogger(
  createEnvironmentFilter({
    processor: plugin,
  }),
);
```

## Configuration Options

`createEnvironmentFilter()` accepts the following configuration options:

- `processor`: The log processor to use. Required.
- `pattern`: The pattern to use for filtering logs. If not provided, the pattern will be loaded from the environment.
- `defaultPattern`: The default pattern to use if no pattern is provided or detected in the environment. Default is `'*'` (all logs).
- `localStorageKey`: The name of the key used to store the pattern in localStorage. Default is `'debug'`.
- `environmentVariable`: The name of the environment variable used to store the pattern. Default is `'DEBUG'`.

Note that the `pattern` option will override any pattern detected in the environment.

## How it Works

`createEnvironmentFilter()` loads the pattern from the environment using the following process:

- It looks for a pattern stored in `localStorage` with the key specified in `localStorageKey`. If found, it uses that pattern.
- If `localStorage` is not available or doesn't contain a pattern with the specified key, it looks for a pattern stored in `process.env` specified in `environmentVariable`. If found, it uses that pattern.
- If no pattern is found in either `localStorage` or the environment variable, it uses the default pattern specified in `defaultPattern`.

Once the pattern is loaded, `createEnvironmentFilter()` uses `createPatternFilter()` from [`@holz/pattern-filter`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-pattern-filter) to create a log processor that filters logs based on the loaded pattern.

## Example

Suppose you want to filter logs in development that come from your app, but disable all logs in production. You can use `@holz/env-filter` to accomplish this by setting the `DEBUG` environment variable in development:

```bash
DEBUG=your-app*
```

In production, you may want to disable all logging by default. This can be done by setting the default pattern to an empty string:

```typescript
import { createEnvironmentFilter } from '@holz/env-filter';
import { createLogger } from '@holz/core';

const logger = createLogger(
  createEnvironmentFilter({
    processor: yourProcessor,
    defaultPattern: '',
  }),
);
```

With this configuration, logs will be disabled by default in production, and only logs originating from the `your-app` namespace will be shown in development.
