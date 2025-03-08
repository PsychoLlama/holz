import { readFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const externals = Object.keys(pkg.dependencies ?? {});

  return defineConfig({
    plugins: [dts({ rollupTypes: true, pathsToAliases: false })],
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-env-filter',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: externals,
        output: {
          exports: 'named',
        },
      },
    },
  });
};
