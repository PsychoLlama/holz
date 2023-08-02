# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[unreleased]: https://github.com/PsychoLlama/holz/compare/v0.6.1...HEAD
[0.6.0]: https://github.com/PsychoLlama/holz/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/PsychoLlama/holz/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/PsychoLlama/holz/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/PsychoLlama/holz/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PsychoLlama/holz/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/PsychoLlama/holz/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/PsychoLlama/holz/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/PsychoLlama/holz/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/PsychoLlama/holz/releases/tag/v0.0.0
