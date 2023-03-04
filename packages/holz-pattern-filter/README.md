# `@holz/pattern-filter`

`@holz/pattern-filter` is a library that allows you to conditionally filter out logs based on a set of patterns. It can be used in combination with other plugins like [`@holz/console-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-console-backend) or [`@holz/ansi-terminal-backend`](https://github.com/PsychoLlama/holz/tree/main/packages/holz-ansi-terminal-backend) to process and display filtered logs.

## Usage

To use `@holz/pattern-filter`, you first need to import it and create a filter with `createPatternFilter()`:

```typescript
import { createPatternFilter } from '@holz/pattern-filter';

const filter = createPatternFilter({
  pattern: 'my-app*, library*, -library:chatty*',
  processor: plugin,
});
```

The `pattern` option is a comma-separated list of patterns that determine which logs to show and which to hide. In the example above, logs with origins that start with `'my-app'` or `'library'` will be shown, but logs with the origin `'library:chatty'` will be hidden.

The `processor` option is where you specify which plugin should process the filtered logs. This can be any Holz plugin.

## Patterns

Patterns are strings that match against `log.origin`, which is a property of each log object. Origins are added when you call `logger.namepspace(...)`. The following syntax is supported:

- `*` matches zero or more characters.
- `-` at the beginning of a pattern negates it, so that logs with origins matching the pattern are hidden rather than shown.

For example:

- `my-app*` matches origins that start with `'my-app'`, such as `'my-app:home'` or `'my-app:login'`.
- `library*, -library:chatty*` matches origins that start with `'library'`, except for origins that start with `'library:chatty'`.
