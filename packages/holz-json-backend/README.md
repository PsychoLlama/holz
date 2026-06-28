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

## Log Rotation

Long-lived processes or noisy services can fill up the disk, given enough time.

Lean on your environment's tools (`journalctl`) or use a package like [rotating-file-stream](https://github.com/iccicci/rotating-file-stream) to prevent files from growing unbounded.
