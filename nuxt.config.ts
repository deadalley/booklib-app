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
    // '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
    'nuxt-echarts',
    'nuxt-electron',
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        prefix: 'bl',
      },
    ],
  },

  // supabase: {
  //   redirect: false,
  //   redirectOptions: {
  //     login: '/login',
  //     callback: '/confirm',
  //     include: undefined,
  //     exclude: [],
  //     cookieRedirect: false,
  //   },
  // },

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

  typescript: {
    strict: true,
  },

  routeRules: {
    '/library': { redirect: '/library/books' },
  },

  compatibilityDate: '2024-08-14',
})
