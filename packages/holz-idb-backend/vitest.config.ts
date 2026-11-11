import { playwright } from '@vitest/browser-playwright';
import { defaultClientConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// IndexedDB needs a real browser, so the whole suite runs in Chromium.
export default defineConfig({
  resolve: {
    // Resolve workspace packages to source, not the build output.
    conditions: ['source', ...defaultClientConditions],
  },
  test: {
    globals: true,
    coverage: {
      include: ['src'],
    },
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: 'chromium' }],
      provider: playwright({
        launchOptions: {
          // Fed from the `#nixos` dev shell, undefined everywhere else.
          //
          // Playwright's bundled instance doesn't run on NixOS without ELF
          // hackery. This is a cheap workaround.
          executablePath: process.env.CHROMIUM_PATH,
        },

        // Cap Playwright's auto-wait loop. The default (30s) lets an action
        // against an unactionable element silently retry until it eats the
        // test budget instead of failing fast with Playwright's diagnostic.
        actionTimeout: 2_000,
      }),
    },
  },
});
