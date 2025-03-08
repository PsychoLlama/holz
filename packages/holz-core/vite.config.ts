import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default async () => {
  return defineConfig({
    plugins: [dts({ rollupTypes: true, pathsToAliases: false })],
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-core',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  });
};
