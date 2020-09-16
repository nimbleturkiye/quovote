module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'no-unused-vars': 'off',
    'no-useless-catch': 'off'
  },

  'extends': [
    'plugin:vue/essential',
    'eslint:recommended',
    '@vue/prettier'
  ]
}
