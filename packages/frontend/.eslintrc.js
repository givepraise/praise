module.exports = {
  plugins: ['react', 'react-hooks'],
  extends: [
    '../../.eslintrc.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
      },
    },
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "commonjs": true,
  },
};
