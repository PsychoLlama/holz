import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

export default defineConfig({
  plugins: [dts({ bundleTypes: true, compilerOptions: { paths: {} } })],
  build: {
    lib: {
      entry: {
        'server-logger': 'src/index.node.ts',
        'browser-logger': 'src/index.browser.ts',
      },
      formats: ['es'],
    },
    rolldownOptions: {
      // Only workspace packages and Node builtins are allowed at runtime.
      external: [/^node:/, /^@holz\//],
    },
  },
});
