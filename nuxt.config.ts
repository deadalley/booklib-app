// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  css: [
    '@/assets/css/main.css',
    '@/assets/css/components.css',
    '@/assets/css/forms.css',
    '@/assets/css/table.css',
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    'nuxt-echarts',
    'nuxt-electron',
    'nuxt-file-storage',
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        prefix: 'bl',
      },
    ],
  },

  electron: {
    build: [
      {
        entry: 'electron/main.ts',
      },
    ],
    disableDefaultOptions: true,
  },
  ssr: false,
  router: {
    options: {
      hashMode: true,
    },
  },

  fileStorage: {
    mount: '/usr',
  },

  typescript: {
    strict: true,
  },

  routeRules: {
    '/library': { redirect: '/library/books' },
  },

  compatibilityDate: '2024-08-14',
})
