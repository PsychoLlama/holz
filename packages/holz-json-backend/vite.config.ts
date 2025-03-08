import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts';

export default async () => {
  const builtins = builtinModules.map((name) => `node:${name}`);

  return defineConfig({
    plugins: [dts({ rollupTypes: true })],
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-json-backend',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: builtins,
        output: {
          exports: 'named',
        },
      },
    },
  });
};
