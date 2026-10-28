import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';

export default defineConfig({
  plugins: [dts({ bundleTypes: true, compilerOptions: { paths: {} } })],
  build: {
    lib: {
      entry: {
        'holz-json-backend': './src/index.ts',
        marshal: './src/marshal/index.ts',
      },
      formats: ['es'],
    },
    rolldownOptions: {
      // Only workspace packages and Node builtins are allowed at runtime.
      external: [/^node:/, /^@holz\//],
    },
  },
});
