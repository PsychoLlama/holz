import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-stream-backend',
        fileName: 'holz-stream-backend',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
