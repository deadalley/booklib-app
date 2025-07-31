import * as Sentry from '@sentry/electron/renderer'

export default defineNuxtPlugin((nuxtApp) => {
  const isElectronEnvironment =
    typeof window !== 'undefined' && 'electronAPI' in window

  // Initialize Sentry for Electron renderer process
  if (isElectronEnvironment) {
    Sentry.init({
      dsn: useRuntimeConfig().public.sentry.dsn,
      debug: true,
      sendDefaultPii: true,
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      Sentry.captureException(event.reason)
    })

    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      Sentry.captureException(event.error)
    })
  }

  nuxtApp.vueApp.config.errorHandler = (error) => {
    console.error(error)

    // Log to Sentry when running in Electron
    if (isElectronEnvironment) {
      Sentry.captureException(error)
    }
  }

  nuxtApp.hook('vue:error', (error) => {
    console.error(error)

    // Log to Sentry when running in Electron
    if (isElectronEnvironment) {
      Sentry.captureException(error)
    }
  })

  // Handle Nuxt-specific errors
  nuxtApp.hook('app:error', (error) => {
    console.error('Nuxt app error:', error)

    if (isElectronEnvironment) {
      Sentry.captureException(error)
    }
  })
})
