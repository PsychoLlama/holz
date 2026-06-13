## Stack

- pnpm (workspace)
- Turbo
- Nix (flakes)

## Structure

- `packages/<name>` is symmetric to `pkg.name`, e.g. `@holz/json-backend` is `holz-json-backend`.
- `packages/holz-core` contains core logic other packages (plugins) extend.

## Rules

- No runtime dependencies except packages in this workspace. `node:*` imports are the exception.
- `pnpm check` must pass before committing.
