import * as Sentry from '@sentry/electron/renderer'

export default defineNuxtPlugin((nuxtApp) => {
  const isElectronEnvironment =
    typeof window !== 'undefined' && 'electronAPI' in window

  // Initialize Sentry for Electron renderer process
  let sentryInitialized = false
  if (isElectronEnvironment) {
    const dsn = useRuntimeConfig().public.sentry.dsn
    if (dsn) {
      Sentry.init({
        dsn,
        debug: import.meta.env.DEV,
        sendDefaultPii: true,
      })
      sentryInitialized = true
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      if (sentryInitialized) {
        Sentry.captureException(event.reason)
      }
    })

    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      console.error('Uncaught error:', event.error)
      if (sentryInitialized) {
        Sentry.captureException(event.error)
      }
    })
  }

  nuxtApp.vueApp.config.errorHandler = (error) => {
    console.error(error)

    // Log to Sentry when running in Electron and Sentry is initialized
    if (isElectronEnvironment && sentryInitialized) {
      Sentry.captureException(error)
    }
  }

  nuxtApp.hook('vue:error', (error) => {
    console.error(error)

    // Log to Sentry when running in Electron and Sentry is initialized
    if (isElectronEnvironment && sentryInitialized) {
      Sentry.captureException(error)
    }
  })

  // Handle Nuxt-specific errors
  nuxtApp.hook('app:error', (error) => {
    console.error('Nuxt app error:', error)

    if (isElectronEnvironment && sentryInitialized) {
      Sentry.captureException(error)
    }
  })
})
