# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `[@holz/pattern-filter]` Initial `v0.1.0` release.
- `[@holz/env-filter]` Initial `v0.1.0` release.
- `[@holz/stream-backend]` Initial `v0.1.0` release.

### Changed

- `[@holz/core]` Exposed `logger.origin` as a read-only property.
- `[@holz/ansi-terminal-backend]` Send all logs to stderr.
- `[@holz/logger]` Log filtering from `DEBUG`/`localStorage.debug`. Logging is no longer enabled by default.
- `[@holz/logger]` Use the stream backend when destination is not a TTY.

## [0.0.0] - 2023-02-20

### Added

- `[@holz/ansi-terminal-backend]` Initial release.
- `[@holz/console-backend]` Initial release.
- `[@holz/core]` Initial release.
- `[@holz/logger]` Initial release.

[unreleased]: https://github.com/PsychoLlama/holz/compare/v0.0.0...HEAD
[0.0.0]: https://github.com/PsychoLlama/holz/releases/tag/v0.0.0
