import type { KnipConfig } from 'knip';

// One config drives both modes:
//
// - `knip:dev` (`knip`) is the full report — unused files, exports, and
//   dependencies. Entries are each package's `src/index.ts` (discovered
//   from vite.config.ts), so genuinely dead modules and exports surface.
//
// - `knip:production` (`knip --production --include dependencies,...`)
//   narrows to dependency hygiene. Every package is an independently
//   published library with no in-repo consumer, so production mode's
//   file/export analysis would prune the export barrels and report every
//   internal module as unused. Those issue types are excluded via
//   `--include`; dev mode already covers them. What remains meaningful is
//   a runtime `dependency` reachable only from tests.
const config = {
  // Some modules export a symbol they also reference internally (e.g. a
  // default value that is exported for reuse). Don't report those.
  ignoreExportsUsedInFile: true,

  // The shared root tsconfig declares `vitest/globals` for the packages
  // (each of which depends on vitest). The root workspace itself has no
  // vitest, so knip can't resolve the type reference from there.
  ignoreUnresolved: ['vitest/globals'],

  workspaces: {
    '.': {
      // treefmt is provided by the nix devShell, not pnpm, but the root
      // `fmt-check` script shells out to it.
      ignoreBinaries: ['treefmt'],

      // Invoked by treefmt (see treefmt.toml), so the usage is invisible
      // to knip.
      ignoreDependencies: ['prettier'],
    },
  },
} satisfies KnipConfig;

export default config;
