// Looks up books scanned while offline: when the app opens and whenever the
// device comes back online.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { process } = useLookupQueue()
    const run = () => {
      process().catch((error) =>
        console.error('Failed to look up queued books:', error),
      )
    }
    run()
    window.addEventListener('online', run)
  })
})
