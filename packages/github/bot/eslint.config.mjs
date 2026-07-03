// @ts-check

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettierEsLint from 'eslint-config-prettier/flat';
import tsEsLint from 'typescript-eslint';

export default defineConfig({
  files: ['**/*.{js,ts}'],
  extends: [js.configs.recommended, tsEsLint.configs.recommended, prettierEsLint],
});
