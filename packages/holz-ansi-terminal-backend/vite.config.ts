import { readFile } from 'fs/promises';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const dependencies = Object.keys(pkg.dependencies ?? {});
  const peerDependencies = Object.keys(pkg.peerDependencies ?? {});
  const builtins = builtinModules.map((name) => `node:${name}`);

  return defineConfig({
    plugins: [dts({ rollupTypes: true, pathsToAliases: false })],
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-ansi-terminal-backend',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: dependencies.concat(peerDependencies).concat(builtins),
        output: {
          exports: 'named',
        },
      },
    },
  });
};
