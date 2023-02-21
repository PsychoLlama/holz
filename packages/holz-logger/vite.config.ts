import { readFile } from 'fs/promises';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const externals = Object.keys(pkg.dependencies ?? {});

  return {
    build: {
      lib: {
        entry: {
          'server-logger': 'src/index.node.ts',
          'browser-logger': 'src/index.browser.ts',
        },
      },
      rollupOptions: {
        external: externals,
        output: {
          exports: 'named',
        },
      },
    },
  };
});
