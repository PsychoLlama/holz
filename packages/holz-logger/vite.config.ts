import { defineConfig } from 'vite';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  plugins: [dts()],
  // Vite strips TypeScript from every `.ts` module, including the `.d.ts`
  // files rolldown-plugin-dts bundles, which leaves them empty.
  oxc: { exclude: [/\.d\.ts$/] },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'processor.browser': 'src/processor.browser.ts',
        'processor.node': 'src/processor.node.ts',
      },
      formats: ['es'],
    },
    rolldownOptions: {
      // Only workspace packages and Node builtins are allowed at runtime.
      // `#processor` stays external so the consumer's bundler picks the
      // runtime variant through the `imports` conditions.
      external: [/^node:/, /^@holz\//, '#processor'],
    },
  },
});
