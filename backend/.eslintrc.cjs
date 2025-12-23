module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'import/order': [
      'warn',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        'newlines-between': 'always',
      },
    ],
  },
};
