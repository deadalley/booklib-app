import tailwind from 'eslint-plugin-tailwindcss'
import vitest from '@vitest/eslint-plugin'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      'vue/no-use-v-if-with-v-for': 0,
      'vue/no-multiple-template-root': 0,
      'vue/multi-word-component-names': 0,
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 0,
      'import/consistent-type-specifier-style': 'off',
    },
  },
  {
    files: ['**/*.test.*'],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
])
