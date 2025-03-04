import importPlugin from 'eslint-plugin-import'
import sonarjs from 'eslint-plugin-sonarjs'
import tsParser from '@typescript-eslint/parser'
// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  sonarjs.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  ...tseslint.config(eslint.configs.recommended, tseslint.configs.recommended),
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    ignores: ['**/node_modules', '**/dist', '*.js', '*.json', '**/coverage'],
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },

    rules: {
      curly: 'error',

      'no-console': ['error', { allow: ['warn', 'error'] }],

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',

          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]
