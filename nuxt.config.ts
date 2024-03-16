// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['@/assets/css/main.css'],
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@nuxtjs/storybook'],
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
})
