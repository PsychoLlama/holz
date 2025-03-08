// @ts-check
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

// This package doesn't have type definitions.
// @ts-expect-error
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
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
      'import/order': 'error',

      // This is already handled by TypeScript.
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['./**/__tests__/*.ts{x,}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
