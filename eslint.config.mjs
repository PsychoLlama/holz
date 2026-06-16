// @ts-check
import { includeIgnoreFile } from '@eslint/config-helpers';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Honor .gitignore (node_modules, dist, coverage, …).
  includeIgnoreFile(import.meta.dirname + '/.gitignore'),
  {
    // The workspace is TypeScript-only, but ESLint lints `.js/.cjs/.mjs`
    // by default — which would otherwise pull in this flat config itself.
    ignores: ['**/*.{js,cjs,mjs}'],
  },
  {
    // Lint scope: package sources only. Replaces the CLI
    // `packages/*/src --ext ts,tsx` arguments so the targets live
    // alongside the config rather than in package.json. The presets are
    // pulled in via `extends` so this `files` scope propagates to them —
    // otherwise their `**/*.ts` patterns would also drag in build/test
    // configs (vite.config.ts, vitest.config.ts) that aren't in any
    // package's tsconfig.
    files: ['packages/*/src/**/*.{ts,tsx}'],
    extends: [
      pluginJs.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
    ],
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'import/order': 'error',

      // This is already handled by TypeScript.
      'import/no-unresolved': 'off',

      // Import hygiene
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-empty-named-blocks': 'error',
      'import/no-useless-path-segments': 'error',
      'import/no-self-import': 'error',
      'import/no-mutable-exports': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-relative-packages': 'error',

      // General opinionated checks
      'no-console': 'error',
      eqeqeq: 'error',
      'func-style': ['error', 'expression'],
      'id-length': ['error', { min: 2, properties: 'never' }],
    },
  },
  {
    // These backends exist to write to the console — it's their whole
    // purpose, so `no-console` doesn't apply to their sources.
    files: [
      'packages/holz-console-backend/src/**/*.ts',
      'packages/holz-ansi-terminal-backend/src/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['./**/__tests__/*.ts{x,}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
