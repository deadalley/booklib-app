// Looks up books saved from a scan whose lookup couldn't run (offline, or
// the book services were down): when the app opens, when the device comes
// back online, and every few minutes while any are waiting.
const RETRY_MS = 5 * 60 * 1000

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { process, pending } = useLookupQueue()
    const run = () => {
      process().catch((error) =>
        console.error('Failed to look up queued books:', error),
      )
    }
    run()
    window.addEventListener('online', run)
    setInterval(() => {
      if (pending.value && navigator.onLine) run()
    }, RETRY_MS)
  })
})
