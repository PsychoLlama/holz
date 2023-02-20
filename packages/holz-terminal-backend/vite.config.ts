import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-terminal-backend',
        fileName: 'holz-terminal-backend',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
