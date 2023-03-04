# `@holz/ansi-terminal-backend`

Pretty-print logs to the terminal.

<img alt="Screenshot of logs printed to the terminal" src="https://user-images.githubusercontent.com/10053423/222926680-0a12da0c-5ff2-40a1-8759-5dca72eb89c3.png" width="600" />

## Usage

```typescript
import { createAnsiTerminalBackend } from '@holz/ansi-terminal-backend';

const logger = createLogger(createAnsiTerminalBackend());
```

> **Note**  
> There is no way to disable colors. The output relies on colors to convey structure. To disable colors, use a different backend such as [`@holz/stream-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-stream-backend).

## Options

```typescript
createAnsiTerminalBackend({
  /**
   * By default it prints to the global console, but you can override it.
   * See: https://nodejs.org/api/console.html#new-consoleoptions
   */
  console: new Console(custom.stdout, custom.stderr),
});
```
