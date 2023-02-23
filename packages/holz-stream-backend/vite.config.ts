import { readFile } from 'fs/promises';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const peerDependencies = Object.keys(pkg.peerDependencies ?? {});
  const builtins = builtinModules.map((name) => `node:${name}`);

  return {
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-stream-backend',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: dependencies.concat(peerDependencies).concat(builtins),
        output: {
          exports: 'named',
        },
      },
    },
  };
});
