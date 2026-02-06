import js from '@eslint/js';
import { config, configs as _configs } from 'typescript-eslint';
import { configs as __configs, processInlineTemplates } from 'angular-eslint';

export default config(
  {
    ignores: [
      '.angular/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'out-tsc/**',
      '*.config.js',
      '*.config.ts',
      'e2e/**',
    ],
  },
  {
    files: ['src/**/*.ts'],
    extends: [
      js.configs.recommended,
      ..._configs.recommended,
      ...__configs.tsRecommended,
    ],
    processor: processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
      },
    },
    rules: {
      '@angular-eslint/prefer-inject': 'off',
      '@angular-eslint/no-empty-lifecycle-method': 'off',
      '@angular-eslint/use-lifecycle-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'parseInt',
          message: 'Use Number.parseInt instead of the global parseInt.',
        },
        {
          name: 'parseFloat',
          message: 'Use Number.parseFloat instead of the global parseFloat.',
        },
        {
          name: 'isNaN',
          message: 'Use Number.isNaN instead of the global isNaN.',
        },
        {
          name: 'isFinite',
          message: 'Use Number.isFinite instead of the global isFinite.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.html'],
    extends: [
      ...__configs.templateRecommended,
      ...__configs.templateAccessibility,
    ],
    rules: {},
  },
  // Spec files: allow any for mocks, ignore unused vars in test setup
  {
    files: ['src/**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
