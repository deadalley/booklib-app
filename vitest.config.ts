import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    // Node 25+ has its own global localStorage, empty unless a storage file
    // is given; it would hide the browser one the test environment provides
    execArgv: ['--no-experimental-webstorage'],
    exclude: [
      '**/node_modules/**',
      '**/.output/**',
      '**/dist/**',
      '**/tests/**',
    ],
    // you can optionally set Nuxt-specific environment options
    // environmentOptions: {
    //   nuxt: {
    //     rootDir: fileURLToPath(new URL('./playground', import.meta.url)),
    //     domEnvironment: 'happy-dom', // 'happy-dom' (default) or 'jsdom'
    //     overrides: {
    //       // other Nuxt config you want to pass
    //     }
    //   }
    // }
  },
})
