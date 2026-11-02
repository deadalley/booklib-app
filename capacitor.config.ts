import type { CapacitorConfig } from '@capacitor/cli'

// Android app. The web app is built with `BUILD_TARGET=capacitor` (see
// nuxt.config.ts) and copied into the native project by `cap sync`.
const config: CapacitorConfig = {
  appId: 'com.booklib.app',
  appName: 'BookLib',
  webDir: '.output/public',
}

export default config
