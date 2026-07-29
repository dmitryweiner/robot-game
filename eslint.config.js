import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['docs/**', 'node_modules/**', 'dist/**', 'playwright-report/**', 'test-results/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Forbid type-coercion via `as`. Use type guards (typeof, instanceof,
      // user-defined predicates) or proper typing instead.
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: ['tests-e2e/**/*.ts', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
