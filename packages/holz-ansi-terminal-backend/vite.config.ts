import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'holz-ansi-terminal-backend',
        fileName: 'holz-ansi-terminal-backend',
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
