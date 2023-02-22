import { readFile } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const builtins = builtinModules.map((name) => `node:${name}`);

  return {
    build: {
      lib: {
        entry: {
          'server-logger': 'src/index.node.ts',
          'browser-logger': 'src/index.browser.ts',
        },
      },
      rollupOptions: {
        external: dependencies.concat(builtins),
        output: {
          exports: 'named',
        },
      },
    },
  };
});
