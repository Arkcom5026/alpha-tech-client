module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true, // ✅ เพิ่มตรงนี้เพื่อให้รู้จัก module, require, __dirname
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ['react', 'react-hooks'],
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/no-unknown-property': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'react/prop-types': 'off',
    },
  };
  