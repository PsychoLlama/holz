import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default async () => {
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
        fileName: 'holz-console-backend',
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
