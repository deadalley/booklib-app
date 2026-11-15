import type { IsbnScan } from '~/components/isbn-scanner.vue'

// The "Add book" flow, shared by every "Add book" button. The chooser and
// the scanner live in the dashboard layout, so scanning happens on the page
// the user is on; the new book page opens only once they choose.
const chooserOpen = ref(false)
const scannerOpen = ref(false)
// A scan waiting to be applied to the new book form
const pendingScan = shallowRef<IsbnScan | null>(null)

export function useAddBook() {
  function openAddBook() {
    chooserOpen.value = true
  }

  function openScanner() {
    chooserOpen.value = false
    scannerOpen.value = true
  }

  async function addManually() {
    chooserOpen.value = false
    pendingScan.value = null
    await navigateTo('/library/books/new')
  }

  async function addFromScan(scan: IsbnScan) {
    scannerOpen.value = false
    pendingScan.value = scan
    await navigateTo('/library/books/new')
  }

  /** The scan to fill the new book with, once */
  function takePendingScan() {
    const scan = pendingScan.value
    pendingScan.value = null
    return scan
  }

  return {
    chooserOpen,
    scannerOpen,
    openAddBook,
    openScanner,
    addManually,
    addFromScan,
    takePendingScan,
  }
}
