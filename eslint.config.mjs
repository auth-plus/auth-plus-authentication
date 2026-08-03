import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import sonarjs from 'eslint-plugin-sonarjs';
import pluginSecurity from 'eslint-plugin-security'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  { ignores: ['dist/**', 'coverage/**', 'build/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node },
    extends: [
      js.configs.recommended,
      tseslint.configs.stylistic,
      tseslint.configs.strict,
      pluginSecurity.configs.recommended,
      sonarjs.configs.recommended
    ],
  },
)
