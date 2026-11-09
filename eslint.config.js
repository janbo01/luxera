import js from '@eslint/js'
import ts from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'warn',
      // Radii come from the scale in docs/design-tokens.md (rounded-xs / sm / lg / full or
      // rounded-[var(--radius)]). One-off pixel radii drift apart over time.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/rounded(-[a-z]{1,2})?-\\[\\d+px\\]/]',
          message:
            'Use a radius token (rounded-xs, rounded-sm, rounded-[var(--radius)], rounded-lg) instead of a one-off pixel radius.',
        },
        {
          selector: 'TemplateElement[value.raw=/rounded(-[a-z]{1,2})?-\\[\\d+px\\]/]',
          message:
            'Use a radius token (rounded-xs, rounded-sm, rounded-[var(--radius)], rounded-lg) instead of a one-off pixel radius.',
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'project/**', '.astro/**'],
  },
)
