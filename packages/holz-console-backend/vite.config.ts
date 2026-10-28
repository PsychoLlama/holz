import { defineConfig } from 'vite';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  plugins: [dts({ compilerOptions: { paths: {} } })],
  // Vite strips TypeScript from every `.ts` module, including the `.d.ts`
  // files rolldown-plugin-dts bundles, which leaves them empty.
  oxc: { exclude: [/\.d\.ts$/] },
  build: {
    lib: {
      entry: { 'holz-console-backend': './src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      // Only workspace packages and Node builtins are allowed at runtime.
      external: [/^node:/, /^@holz\//],
    },
  },
});
