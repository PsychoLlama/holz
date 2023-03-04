# `@holz/console-backend`

Pretty-print logs to the browser console.

<img alt="Screenshot of logs printed to the browser console" src="https://user-images.githubusercontent.com/10053423/222927532-2925b0a3-9494-4de7-b328-917ceb8607b0.png" width="600" />

## Usage

```typescript
import { createConsoleBackend } from '@holz/console-backend';

const logger = createLogger(createConsoleBackend());
```

> **Note**  
> This is fine-tuned for an interactive browser console. If you want pretty-printed logs in Node or Deno, try [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) instead.

## Options

```typescript
createConsoleBackend({
  /**
   * By default it prints to the global console, but you can override it.
   */
  console: typeof console,
});
```
