import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // Resolve `#processor` to source, not the build output.
    resolve: { conditions: ['source', ...defaultServerConditions] },
  },
  test: {
    globals: true,
    coverage: {
      include: ['src'],
    },
  },
});
