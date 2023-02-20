import { defineConfig } from 'vite';

export default defineConfig(async () => {
  return {
    build: {
      lib: {
        entry: {
          'server-logger': 'src/index.node.ts',
          'browser-logger': 'src/index.browser.ts',
        },
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
