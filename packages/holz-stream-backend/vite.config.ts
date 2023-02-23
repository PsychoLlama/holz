import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const builtins = builtinModules.map((name) => `node:${name}`);

  return {
    build: {
      lib: {
        entry: './src/index.ts',
        fileName: 'holz-stream-backend',
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: builtins,
        output: {
          exports: 'named',
        },
      },
    },
  };
});
