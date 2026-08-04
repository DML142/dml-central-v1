import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tailwind from 'eslint-plugin-tailwindcss';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'prototype/**',
    'next-env.d.ts',
  ]),

  ...nextVitals,
  ...nextTs,
  tailwind.configs.recommended,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: { cssConfigPath: 'src/app/globals.css' },
    },
    plugins: { tailwindcss: tailwind },
    rules: {
      // prettier-plugin-tailwindcss already sorts class lists on write.
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-arbitrary-value': 'error',
      'tailwindcss/no-custom-classname': 'off',
    },
  },

  // `eslint-config-next` already registers the `jsx-a11y` and `import` plugins, so only
  // their rule sets are pulled in here — re-registering the plugin is a config error.
  {
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,

      'import/no-unresolved': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
            'object',
          ],
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'before' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  prettier,
]);
