// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css', '@/assets/css/forms.css'],

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxt/eslint',
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        prefix: 'bl',
      },
    ],
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: [],
      cookieRedirect: false,
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-08-14',
})
