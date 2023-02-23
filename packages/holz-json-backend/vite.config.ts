import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig(async () => {
  const builtins = builtinModules.map((name) => `node:${name}`);

  return {
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
  };
});
