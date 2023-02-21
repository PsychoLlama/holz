import { defineConfig } from 'vite';
import { readFile } from 'fs/promises';

export default defineConfig(async () => {
  const pkg = JSON.parse(await readFile('./package.json', 'utf-8'));
  const externals = Object.keys(pkg.dependencies ?? {});

  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-env-filter',
        fileName: 'holz-env-filter',
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
