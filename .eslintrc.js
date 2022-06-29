module.exports = {
  root: true,
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    project: ['./packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'node', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:node/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  ignorePatterns: ['dist', 'scripts'],
  rules: {
    'import/no-unresolved': 'error',
    'prettier/prettier': 'error',
    'block-scoped-var': 'error',
    eqeqeq: 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'eol-last': 'error',
    'prefer-arrow-callback': 'error',
    'no-trailing-spaces': 'error',
    quotes: ['warn', 'single', { avoidEscape: true }],
    'no-restricted-properties': [
      'error',
      {
        object: 'describe',
        property: 'only',
      },
      {
        object: 'it',
        property: 'only',
      },
    ],
    "import/order": ["error",
      {
        "groups":
          [
            "external",
            "builtin",
            "internal",
            "sibling",
            "parent",
            "index"
          ]
      }
    ],
    'import/no-default-export': 'error',
  },
  settings: {
    'import/extensions': ['.ts', '.tsx'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-use-before-define': 'warn',
        '@typescript-eslint/no-warning-comments': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'node/no-missing-import': 'off',
        'node/no-empty-function': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-require': 'off',
        'node/shebang': 'warn',
        'no-dupe-class-members': 'off',
        'require-atomic-updates': 'off',
        'import/no-default-export': 'error',
      },
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
    },
  ],
};
