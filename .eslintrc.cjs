module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  extends: [
    '@nuxt/eslint-config',
    'plugin:prettier/recommended',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'vue/no-multiple-template-root': 0,
    'vue/multi-word-component-names': 0,
    'vue/require-default-prop': 'off',
    'prettier/prettier': ['error', { singleQuote: true, semi: false }],
  },
}
