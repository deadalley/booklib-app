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
    ...(process.env.ELECTRON_ENABLED === 'true' ? ['nuxt-electron'] : []),
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

  ...(process.env.ELECTRON_ENABLED === 'true'
    ? {
        electron: {
          build: [
            {
              entry: 'electron/main.ts',
              vite: {
                build: {
                  rollupOptions: {
                    external: ['electron'],
                  },
                },
              },
            },
            {
              entry: 'electron/preload.ts',
              onstart(args: { reload: () => void }) {
                // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
                // instead of restarting the entire Electron App.
                args.reload()
              },
            },
          ],
          // Ployfill the Electron and Node.js API for Renderer process.
          // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
          // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
          renderer: {},
          disableDefaultOptions: true,
        },
      }
    : {}),

  ssr: true,
  router: {
    options: {
      hashMode: true,
    },
  },

  fileStorage: {
    mount: 'usr',
  },

  typescript: {
    strict: true,
  },

  routeRules: {
    '/library': { redirect: '/library/books' },
  },

  compatibilityDate: '2024-08-14',
})
