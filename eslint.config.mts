import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import sonarjs from 'eslint-plugin-sonarjs'
import pluginSecurity from 'eslint-plugin-security'

export default defineConfig([
  { ignores: ['dist/**', 'coverage/**', 'build/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node },
  },
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  sonarjs.configs.recommended,
  pluginSecurity.configs.recommended,
])
