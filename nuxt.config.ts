// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import { activeTheme, themeBootScript, themeCss } from './utils/theme'

// `BUILD_TARGET=capacitor` builds the static app that is bundled into the
// Android app (see capacitor.config.ts).
const isCapacitorBuild = process.env.BUILD_TARGET === 'capacitor'

// Theme tokens as CSS variables plus a blocking script that applies the saved
// light/dark preference before first paint (see utils/theme.ts).
const head = {
  meta: [{ name: 'theme-color', content: activeTheme.colors.surface.canvas }],
  style: [{ id: 'booklib-theme', innerHTML: themeCss() }],
  script: [{ innerHTML: themeBootScript, tagPosition: 'head' as const }],
}

export default defineNuxtConfig({
  devtools: { enabled: true },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    // Capacitor loads `index.html` from the web directory, so render the
    // entry route instead of only the `200.html` SPA fallback.
    ...(isCapacitorBuild ? { prerender: { routes: ['/'] } } : {}),
  },

  vite: {
    plugins: [tailwindcss()],
  },

  css: ['@/assets/css/main.css'],

  modules: [
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
        pathPrefix: false,
      },
    ],
  },

  app: { head },

  ...(process.env.ELECTRON_ENABLED === 'true'
    ? {
        app: {
          head,
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
          provider: 'ipxStatic',
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
    // Former standalone pages, now part of Data Management
    '/import': { redirect: '/data-management' },
    '/export': { redirect: '/data-management' },
  },

  // The styleguide is a development tool; keep it out of production builds
  ignore: process.env.NODE_ENV === 'production' ? ['pages/styleguide.vue'] : [],

  compatibilityDate: '2024-12-15',
})
