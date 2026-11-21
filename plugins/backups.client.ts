// Makes the daily backup when the app opens
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    useBackups()
      .backUpIfDue()
      .catch((error) => console.error('Automatic backup failed:', error))
  })
})
