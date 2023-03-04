# `@holz/json-backend`

Prints structured logs to a writable stream in NDJSON form.

## Usage

```typescript
import { createJsonBackend } from '@holz/json-backend';
import { createLogger } from '@holz/core';
import * as fs from 'node:fs';

const logger = createLogger(
  createJsonBackend({
    stream: fs.createWriteStream('my-app.log', { flags: 'a' }),
  })
);
```

Logs are output in [NDJSON](http://ndjson.org/) format. The output is optimized for log files, following the order of typical log statements. The output includes the log level, timestamp, message, and context, if provided.

The `stream` option specifies where the logs will be written to. You can use any writable stream, such as a file or `process.stdout`.
