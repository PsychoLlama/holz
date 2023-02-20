import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-console-backend',
        fileName: 'holz-console-backend',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
