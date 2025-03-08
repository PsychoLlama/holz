import { readFile } from 'fs/promises';
import { builtinModules } from 'module';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const builtins = builtinModules.map((name) => `node:${name}`);

  return defineConfig({
    plugins: [dts({ rollupTypes: true })],
    build: {
      lib: {
        entry: {
          'server-logger': 'src/index.node.ts',
          'browser-logger': 'src/index.browser.ts',
        },
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: dependencies.concat(builtins),
        output: {
          exports: 'named',
        },
      },
    },
  });
};
