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
    // Only include Sentry module when not running in Electron
    ...(process.env.ELECTRON_ENABLED !== 'true' ? ['@sentry/nuxt/module'] : []),
    'nuxt-echarts',
    ...(process.env.ELECTRON_ENABLED === 'true' ? ['nuxt-electron'] : []),
    'nuxt-file-storage',
  ],

  runtimeConfig: {
    public: {
      sentry: {
        dsn: process.env.SENTRY_DSN, // Use a public environment variable for the DSN
      },
    },
  },

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
        app: {
          baseURL: './',
          buildAssetsDir: '_nuxt/',
          cdnURL: './',
        },
        router: {
          options: {
            hashMode: true,
          },
        },
        image: {
          dir: 'public',
          format: ['webp', 'jpg', 'png', 'svg'],
          provider: 'static',
          staticFilename: './{name}.{format}',
        },
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

  ssr: false,

  fileStorage: {
    mount: 'usr',
  },

  tailwindcss: {
    exposeConfig: true,
  },

  typescript: {
    strict: true,
  },

  sentry: {
    sourceMapsUploadOptions: {
      org: 'deadalley',
      project: 'javascript-nuxt',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
    autoInjectServerSentry: 'top-level-import',
  },

  sourcemap: { client: 'hidden' },

  routeRules: {
    '/library': { redirect: '/library/books' },
  },

  compatibilityDate: '2024-08-14',
})
