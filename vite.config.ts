import { defineConfig } from 'vite';
import { readFile } from 'fs/promises';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'strog',
        fileName: 'strog',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
