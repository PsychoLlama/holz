import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-core',
        fileName: 'holz-core',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
