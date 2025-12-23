module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  extends: ['eslint:recommended'],
  settings: {
    react: { version: '18.0' },
  },
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
