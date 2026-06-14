import { defineConfig } from 'vite';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts';

export default async () => {
  const builtins = builtinModules.map((name) => `node:${name}`);

  return defineConfig({
    plugins: [
      dts({
        bundleTypes: true,
        pathsToAliases: false,
        compilerOptions: { paths: {}, rootDir: 'src' },
      }),
    ],
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-log-collector',
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
