import pk from 'eslint-config-pk';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.pnpm-store/**',
      'dist/**',
      'node_modules/**',
      'types/**',
    ],
  },
  ...pk,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
        parser: tseslint.parser,
        sourceType: 'module',
      },
    },
  },
  {
    // core rules from `eslint:recommended` do not understand TypeScript-only syntax
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-dupe-class-members': 'off',
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
  {
    // `_key` is part of the public tab contract, `_close` is the document-level
    // click handler and `_tabs` mirrors the internal ref, so these names stay in
    // `lib/` and in `tests/` asserting the contract
    files: ['lib/**/*.ts', 'lib/**/*.vue', 'tests/**/*.ts'],
    rules: {
      'no-underscore-dangle': [
        'error',
        {
          allow: ['_close', '_key', '_tabs'],
          allowFunctionParams: true,
        },
      ],
    },
  },
  { rules: { 'vue/multi-word-component-names': 'off' } },
];
