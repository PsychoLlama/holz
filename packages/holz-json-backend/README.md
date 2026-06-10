# `@holz/json-backend`

Serializes structured logs to a writable stream in [NDJSON](https://github.com/ndjson/ndjson-spec) format.

## Usage

This backend serializes logs into a [`WritableStream<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream). Each chunk is UTF-8 encoded. Ideal for append-only log files.

Target environments are servers, host endpoints, and browsers (via [OPFS](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable)).

```typescript
import { createJsonBackend } from '@holz/json-backend';
import { createLogger } from '@holz/core';

const logger = createLogger(
  createJsonBackend({
    stream: new WritableStream<Uint8Array>(
      {
        // ...
      },
      new CountQueuingStrategy({
        highWaterMark: 1024,
      }),
    ),
  }),
);
```

### Node Streams

Node's streams shipped long before the web standard and need to be wrapped with [Writable.toWeb](https://nodejs.org/api/stream.html#streamwritabletowebstreamwritable):

```typescript
import { createWriteStream } from 'node:fs';
import { Writable } from 'node:stream';

createJsonBackend({
  stream: Writable.toWeb(createWriteStream('logs.ndjson', { flags: 'a' })),
}),
```

The same adapter works for any Node writable, including `process.stderr`.

### Closing the Stream

By default, the stream remains open forever. Pass an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) to control the shutdown.

```typescript
const controller = new AbortController();

createJsonBackend({
  stream: writableStream,
  signal: controller.signal,
});

// Permanently close the writable stream.
controller.abort();
```

Tap the stream's [close](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream/WritableStream#closecontroller) handler or node's [finish](https://nodejs.org/api/fs.html#event-finish) event for a clean shutdown.

## Caveats

- Writes are fire-and-forget. Stream backpressure from an overwhelmed sink will cause logs to be dropped. Use [CountQueuingStrategy](https://developer.mozilla.org/en-US/docs/Web/API/CountQueuingStrategy) to adjust the log buffer.
- Long-running processes and noisy services create giant files. Lean on your environment's tools (`journalctl`) or use a package like [rotating-file-stream](https://github.com/iccicci/rotating-file-stream).
- OPFS streams in browser environments have poor durability. You may need synchronous access to periodically flush writes, an API only available in workers.
