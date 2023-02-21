<div align="center">
  <h1>Holz</h1>
  <p>A structured, composable logging framework.</p>
</div>

## Project Status

:construction: Unstable Concept :construction:

## Purpose

Most logging frameworks are destructive. The act of converting logs to strings partially destroys the data it contained. Instead, Holz uses pipelines of structured data:

```typescript
logger.info('Sending new user email', { userId: user.id });
```

```typescript
{
  message: 'Sending new user email',
  level: LogLevel.Info,
  origin: ['UserService'],
  context: { userId: '465ebaec-2b53-4b81-95e9-9f35771c0af2' },
}
```

Eventually a plugin converts it to a string, but it happens at the end of the line. Anywhere in between you can filter, transform, upload, or reroute your logs without touching a single regex.

## Usage

Holz is built on a chain of plugins, but everything is still in flux right now. Use the bundled package:

```typescript
import logger from '@holz/logger';
```

But honestly you shouldn't. Not yet, at least.

## Another Logging Framework?

I'm tired of using bad logging frameworks. There are plenty of good ones, but they aren't popular enough or maintained well enough to be trusted. If I build my own I won't have to compromise.
