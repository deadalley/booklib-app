export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error) => {
    console.error(error)
  }

  nuxtApp.hook('vue:error', (error) => {
    console.error(error)
  })
})
