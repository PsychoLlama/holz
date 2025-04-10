# `@holz/stream-backend`

A Holz plugin that streams logs in plaintext. It is optimized for log files.

## Usage

To use `@holz/stream-backend`, you first need to import it and create a backend with `createStreamBackend()`:

```typescript
import { createStreamBackend } from '@holz/stream-backend';
import { createLogger } from '@holz/core';
import * as fs from 'fs';

createLogger(
  createStreamBackend({
    stream: fs.createWriteStream('server.log', { flags: 'a' }),
  }),
);
```

The `stream` option specifies the NodeJS writable stream that the logs should be written to. You can use any writable stream, such as a file or `process.stderr`.

> **Note**  
> If your system supports JSON, consider [`@holz/json-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-json-backend) as a structured alternative.

## Example Output

When you write logs using `@holz/stream-backend`, they are formatted as plaintext and written to the stream. Each log entry is separated by a line break.

```
2023-03-04T21:58:11.620Z INFO  [app:devices] Requesting media devices
2023-03-04T21:58:14.288Z INFO  [app:devices] Received media stream kind=["audio"]
2023-03-04T21:58:14.288Z WARN  [app:devices] User does not have a camera
2023-03-04T21:58:14.288Z INFO  [app:rtc] Creating WebRTC session signalingMode="polite"
2023-03-04T21:58:14.288Z INFO  [app:signaling] Opening signaling channel
2023-03-04T21:58:14.346Z DEBUG [app:signaling] Signaling channel is open
2023-03-04T21:58:14.347Z INFO  [app:rtc] Sending session description type="offer"
2023-03-04T21:58:14.491Z INFO  [app:rtc] Receiving session description type="answer"
2023-03-04T21:58:14.494Z DEBUG [app:rtc] Sending ICE candidate type="UDP" ip="10.0.0.10" port="33150"
2023-03-04T21:58:14.494Z INFO  [app:rtc] Attaching local media tracks kind=["audio"]
2023-03-04T21:58:14.619Z DEBUG [app:rtc] Receiving ICE candidate type="UDP" ip="10.0.0.11" port="36877"
2023-03-04T21:58:14.630Z INFO  [app:rtc] Testing remote candidates...
2023-03-04T21:58:14.684Z INFO  [app:rtc] Connection successful.
```

Note that the logs include a timestamp, log level, namespace, message, and any additional context that was provided.
