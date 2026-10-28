# `@holz/json-backend`

Prints structured logs to a writable stream in NDJSON form.

## Usage

```typescript
import { createJsonBackend } from '@holz/json-backend';
import { createLogger } from '@holz/core';
import { createWriteStream } from 'node:fs';

const logger = createLogger(
  createJsonBackend({
    stream: createWriteStream('my-logs.ndjson', { flags: 'a' }),
  }),
);
```

Logs are output in [NDJSON](https://github.com/ndjson/ndjson-spec) format. The output is optimized for log files, following the order of typical log statements. The output includes the log level, timestamp, message, and context, if provided.

The `stream` option specifies where the logs will be written to. You can use any writable stream, such as a file or `process.stdout`.

## Changes to `Log`

This plugin converts a few fields to make the JSON representation useful and readable:

- `log.level`: Replaced with a string mirroring its key in [level](https://github.com/PsychoLlama/holz/tree/main/packages/holz-core#log-levels).
- `log.timestamp`: Converted to an ISO 8601 date string.
- `log.context.error`: Serialized as plain values, with recursive handling for nested [cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) and [errors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError/errors).

Conversion tools are exported separately and can be used in other environments outside NodeJS.

```ts
import { toJSON, errorToJSON } from '@holz/json-backend/marshal';

// Convert a log to a JSON-suitable object.
JSON.stringify(toJSON(log));

// Convert an error on its own, for errors outside `context.error`.
errorToJSON(new Error('Boom', { cause: new Error('Root cause') }));
```

## Rotation and Compression

Long-lived processes or noisy services can fill up the disk, given enough time.

Lean on your environment's tools (`journalctl`) or use a package like [rotating-file-stream](https://github.com/iccicci/rotating-file-stream) to prevent files from growing unbounded.
