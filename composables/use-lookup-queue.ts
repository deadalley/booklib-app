import { lookupIsbn } from '~/services/book-lookup'
import {
  placeholderTitle,
  processLookupQueue,
  readLookupQueue,
  writeLookupQueue,
  type QueuedLookup,
} from '~/services/lookup-queue'

// Shared across the app: one queue per device
const pending = ref(0)
// Titles of books filled in by the last run, for a confirmation
const lastFilled = ref<string[]>([])
let running: Promise<void> | null = null

/** Books scanned while offline, looked up when the device is back online */
export function useLookupQueue() {
  const { getBook, updateBook, getAuthors, downloadBookCover } =
    useBookLibrary()

  function sync() {
    pending.value = readLookupQueue().length
  }

  function enqueue(bookId: string, isbn: string) {
    const item: QueuedLookup = {
      bookId,
      isbn,
      placeholderTitle: placeholderTitle(isbn),
      queuedAt: new Date().toISOString(),
    }
    writeLookupQueue([
      ...readLookupQueue().filter((queued) => queued.bookId !== bookId),
      item,
    ])
    sync()
  }

  async function run() {
    const items = readLookupQueue()
    if (!items.length) return
    const { filled, remaining } = await processLookupQueue(items, {
      lookup: (isbn) => lookupIsbn(isbn),
      getBook,
      updateBook,
      getAuthors,
      downloadCover: downloadBookCover,
    })
    // Scans queued while this ran are kept
    const handled = new Set(items.map(({ bookId }) => bookId))
    writeLookupQueue([
      ...remaining,
      ...readLookupQueue().filter(({ bookId }) => !handled.has(bookId)),
    ])
    sync()
    if (filled.length) lastFilled.value = filled
  }

  /** Runs the queue once at a time */
  function process() {
    running ??= run().finally(() => (running = null))
    return running
  }

  sync()

  return {
    pending: readonly(pending),
    lastFilled,
    enqueue,
    process,
  }
}
