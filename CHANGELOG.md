# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

## [0.8.1] - 2025-04-16

### Removed

- Packages no longer ship source files, only compiled `dist/` assets. You shouldn't notice a difference except download size.

### Fixed

- `[@holz/log-collector]` No longer published as an RC release - it now has a stable version.
- `[@holz/logger]` Replaced the log collector plugin with a stable version.

## [0.8.0] - 2025-04-12

### Added

- `[@holz/core]` Support for `Trace` and `Fatal` log levels.
- `[@holz/core]` Now supports custom fields in log context that don't adhere to the JSON-serializable constraint. The primary use case is a special `error` value. Plugins can define their own reserved fields.
- `[@holz/core]` New `timestamp` field available on all `Log` objects.
- `[@holz/core]` New `withMiddleware(...)` method which supports overlaying plugins on the base configuration.
- `[@holz/json-backend]` Now detects and serializes `Error` values, including error causes and enumerable custom properties. Stack traces are not included. Raise an issue if you have a use case.
- `[@holz/stream-backend]` Support for `Error` values. Prints immediately after the log line.
- `[@holz/console-backend]` Support for featuring `Error` values prominently.
- `[@holz/log-collector]` New plugin supporting global log collection.
- `[@holz/logger]` Added global log collector to the default plugin set.

### Changed

- `[@holz/core]` The `LogLevel` enum was replaced with a `levels` object supporting [erasableSyntaxOnly](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/), an effort by TypeScript to focus on types instead of code transformation. `LogLevel` is still exported, but it only represents a type, not a value.
- `[@holz/core]` Log levels became numbers instead of strings. This supports filtering all logs below a certain level, such as `>= level.info`. While strings were convenient for display, most backends specialize with their own representation.
- `[@holz/core]` If log context contains an `error` key, it MUST be an `Error` value.

### Fixed

- `[@holz/core]` Plugin types support async functions now. The return value is discarded, so you may still consider wrapping calls for error handling.

## [0.7.0] - 2025-03-08

### Added

- `[@holz/core]` Exports the `Logger` type which is returned by `createLogger`.

### Changed

- TypeScript declaration files are published with every package. Previous versions pointed to the source for types, which was much less stable.
- Packages no longer support legacy `main` and `module` fields. All modern tools support `exports` fields. You should not see a difference.

## [0.6.1] - 2023-08-02

### Fixed

- Resolved a TypeScript error when using PnP where `@holz/core` was unresolvable.

## [0.6.0] - 2023-03-05

### Added

- `[@holz/core]` Bound logging methods so they can be passed as first-class functions.
- Documentation for all packages.

### Changed

- `[@holz/logger]` Disable all logs by default. This makes it reasonable to use Holz as a logging solution in other libraries.

## [0.5.0] - 2023-03-04

### Added

- `[@holz/env-filter]` New options `localStorageKey` and `environmentVariable` configure where to look for patterns.
- `[@holz/ansi-terminal-backend]` Auto-indent for messages spanning multiple lines.

### Changed

- **Plugins are functions now.** This improves bundle size and composition at the expense of broad changes.
- Every plugin's export was replaced with a function instead of a class, so `import { FooBackend }` becomes `import { createFooBackend }`.
- `[@holz/core]` Renamed `logger.origin` to `logger.owner`.

### Removed

- All classes and default entrypoints were removed. They were replaced with the plain functions described above.
- `[@holz/env-filter]` Changing the pattern at runtime is no longer supported. It's better to create a new instance of the plugin.

## [0.4.0] - 2023-02-23

### Added

- `[@holz/json-backend]` Initial release.

### Changed

- `[@holz/stream-backend]` Use OS-sensitive line endings.

### Fixed

- `[@holz/stream-backend]` Avoid bundling core, list as peer dependency.
- `[@holz/ansi-terminal-backend]` Avoid bundling core, list as peer dependency.

## [0.3.0] - 2023-02-23

### Changed

- `[@holz/logger]` Enable all server logs by default.
- `[@holz/logger]` Hide logs in unit tests.
- `[@holz/console-backend]` Make log styling more consistent and reduce bundle size.
- `[@holz/console-backend]` Add time deltas to log messages.

## [0.2.0] - 2023-02-23

### Fixed

- `[@holz/env-filter]` Last publish included outdated artifacts.
- `[@holz/env-filter]` Avoid bundling pattern-filter dependency into dist.
- Migrated all compilation scripts to run before publish to avoid stale publishes in the future.
- Replaced UMD bundles with commonjs on all packages (used for `require`).

## [0.1.1] - 2023-02-23

### Fixed

- `[@holz/env-filter]` Don't save pattern to `localStorage` by default.

## [0.1.0] - 2023-02-23

### Added

- `[@holz/pattern-filter]` Initial release.
- `[@holz/env-filter]` Initial release.
- `[@holz/stream-backend]` Initial release.
- `[@holz/ansi-terminal-backend]` Now logs include timestamps.

### Changed

- `[@holz/core]` Exposed `logger.origin` as a read-only property.
- `[@holz/ansi-terminal-backend]` Send all logs to stderr.
- `[@holz/logger]` Log filtering from `DEBUG`/`localStorage.debug`. Logging is no longer enabled by default.
- `[@holz/logger]` Use the stream backend when destination is not a TTY.
- `[@holz/console-backend]` Remove log level prefix and use `console.info`/`console.debug` APIs instead.

## [0.0.0] - 2023-02-20

### Added

- `[@holz/ansi-terminal-backend]` Initial release.
- `[@holz/console-backend]` Initial release.
- `[@holz/core]` Initial release.
- `[@holz/logger]` Initial release.

[UNRELEASED]: https://github.com/PsychoLlama/holz/compare/v0.8.1...HEAD
[0.8.1]: https://github.com/PsychoLlama/holz/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/PsychoLlama/holz/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/PsychoLlama/holz/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/PsychoLlama/holz/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/PsychoLlama/holz/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/PsychoLlama/holz/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/PsychoLlama/holz/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PsychoLlama/holz/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PsychoLlama/holz/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/PsychoLlama/holz/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/PsychoLlama/holz/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/PsychoLlama/holz/releases/tag/v0.0.0
