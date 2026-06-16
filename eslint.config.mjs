// @ts-check
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
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
