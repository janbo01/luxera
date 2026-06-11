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
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'project/**'],
  },
)
