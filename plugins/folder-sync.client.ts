import { LIBRARY_CHANGED_EVENT } from '~/services/database-client'

// Folder sync runs when the app opens, when its window comes back into
// focus, and a few seconds after the library changes here.
const AFTER_CHANGE_MS = 3000
const FOCUS_MIN_GAP_MS = 30_000

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const { supported, folder, sync } = useFolderSync()
    if (!supported) return

    let changeTimer: ReturnType<typeof setTimeout> | undefined
    let lastFocusSync = 0

    const run = () => {
      if (folder.value) sync()
    }
    run()

    window.addEventListener(LIBRARY_CHANGED_EVENT, () => {
      clearTimeout(changeTimer)
      changeTimer = setTimeout(run, AFTER_CHANGE_MS)
    })
    window.addEventListener('focus', () => {
      if (Date.now() - lastFocusSync < FOCUS_MIN_GAP_MS) return
      lastFocusSync = Date.now()
      run()
    })
  })
})
