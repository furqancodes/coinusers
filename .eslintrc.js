module.exports = {
  extends: ['google', 'eslint:recommended', 'plugin:import/errors'],
  env: {
    node: true,
    jest: true,
    es2020: true,
  },
  rules: {
    // off
    'no-implicit-coercion': 'off',
    'no-multiple-empty-lines': 'off',
    'curly': 'off',
    'one-var': 'off',
    'guard-for-in': 'off',


    // warn

    'camelcase': 'warn',
    'valid-jsdoc': ['warn', {
      'requireParamType': true,
      'prefer': {
        'arg': 'param',
        'argument': 'param',
      },
      'preferType': {
        'Boolean': 'boolean',
        'Number': 'number',
        'String': 'string',
        'object': 'Object',
        'array': 'Array',
        'function': 'Function',
      },
    }],
    'comma-dangle': ['warn', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'never',
    }],
    'no-multi-spaces': ['warn', {'ignoreEOLComments': true}],
    'require-jsdoc': 'off',
    'brace-style': ['warn', '1tbs', {'allowSingleLine': true}],
    'arrow-parens': ['warn', 'as-needed', {'requireForBlockBody': true}],
    'space-before-function-paren': 'warn',
    'no-invalid-this': 'warn',
    'no-prototype-builtins': 'warn',
    'no-trailing-spaces': 'warn',
    'no-process-exit': 'warn',
    'arrow-spacing': 'warn',
    'space-before-blocks': 'warn',
    'keyword-spacing': 'warn',
    'indent': ['warn', 2, {'SwitchCase': 1}],
    'key-spacing': ['warn', {'beforeColon': false, 'afterColon': true, 'mode': 'minimum'}],
    'comma-spacing': ['warn', {'before': false, 'after': true}],
    'no-return-await': 'warn',
    'import/order': [
      'warn', {
        'groups': ['builtin', 'external'],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always',
      },
    ],

    // error
    'no-var': 'error',
    'prefer-const': 'error',
    'semi': ['error', 'never'],
    'max-len': ['error', 150, 4],
    'generator-star-spacing': ['error', {before: true, after: false}],
    'quotes': ['error', 'single', {'avoidEscape': true}],
    'object-curly-spacing': ['error', 'never'],
    'new-cap': [
      'error',
      {
        'capIsNewExceptions': [
          'DataTypes.ARRAY',
          'DataTypes.STRING',
          'Sequelize.ARRAY',
          'Sequelize.STRING',
          'DataTypes.ENUM',
          'Sequelize.ENUM',
          's3Stream.WriteStream',
        ],
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
}
