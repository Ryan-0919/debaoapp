import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

export default [
  {ignores: ['dist/**', 'src/.umi*/**', '.umi*/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'e2e-artifacts/**']},
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {parser: tsParser, parserOptions: {ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: {jsx: true}}},
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off'
    }
  }
];
