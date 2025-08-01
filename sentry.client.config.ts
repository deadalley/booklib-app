import * as Sentry from '@sentry/nuxt'

// Only initialize Sentry if not in local development
if (process.env.NODE_ENV !== 'development') {
  console.log('Initializing Sentry for Nuxt...')
  Sentry.init({
    // If set up, you can use the Nuxt runtime config here
    dsn: useRuntimeConfig().public.sentry.dsn,
    // modify depending on your custom runtime config
    // dsn: process.env.SENTRY_DSN || '',

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    debug: false,
  })
}
