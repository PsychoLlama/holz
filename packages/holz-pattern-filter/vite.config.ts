import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-pattern-filter',
        fileName: 'holz-pattern-filter',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
