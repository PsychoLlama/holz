import { defineConfig } from 'vite';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  // Vite strips TypeScript from every `.ts` module, including the `.d.ts`
  // files rolldown-plugin-dts bundles, which leaves them empty.
  oxc: { exclude: [/\.d\.ts$/] },
  build: {
    lib: {
      entry: { 'holz-pattern-filter': './src/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      // Only workspace packages and Node builtins are allowed at runtime.
      external: [/^node:/, /^@holz\//],
    },
  },
});
