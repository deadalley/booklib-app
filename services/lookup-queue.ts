import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import {
  bookPatchFromLookup,
  LookupOfflineError,
  LookupUnavailableError,
  type BookLookupResult,
} from './book-lookup'

/*
 * Books saved from a scan while offline. Their details are looked up once
 * the device is back online. The queue lives in this device's localStorage:
 * it only matters until the lookup runs, so it is not part of the library
 * data or its exports.
 */

export type QueuedLookup = {
  bookId: string
  isbn: string
  // The title the book was saved with, replaced by the real one
  placeholderTitle: string
  queuedAt: string
}

export const LOOKUP_QUEUE_KEY = 'booklib.isbn-lookups'

export const placeholderTitle = (isbn: string) => `ISBN ${isbn}`

export function readLookupQueue(): QueuedLookup[] {
  try {
    const items = JSON.parse(localStorage.getItem(LOOKUP_QUEUE_KEY) ?? '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

export function writeLookupQueue(items: QueuedLookup[]) {
  try {
    if (items.length) {
      localStorage.setItem(LOOKUP_QUEUE_KEY, JSON.stringify(items))
    } else {
      localStorage.removeItem(LOOKUP_QUEUE_KEY)
    }
  } catch {
    // Storage unavailable: the book keeps its ISBN and can be looked up later
  }
}

export type LookupQueueDeps = {
  lookup: (isbn: string) => Promise<BookLookupResult | null>
  getBook: (id: string) => Promise<Book | null>
  updateBook: (id: string, patch: Partial<Book>) => Promise<unknown>
  getAuthors: () => Promise<Pick<Author, 'id' | 'name'>[]>
  // Saves the cover where supported; may be left out
  downloadCover?: (id: string, url: string) => Promise<unknown>
}

/**
 * Looks up every queued book and fills in what it is missing. Books whose
 * ISBN is unknown leave the queue as they are; while offline, everything
 * stays queued for the next try.
 */
export async function processLookupQueue(
  items: QueuedLookup[],
  deps: LookupQueueDeps,
): Promise<{ filled: string[]; remaining: QueuedLookup[] }> {
  const filled: string[] = []
  const remaining: QueuedLookup[] = []
  let authors: Pick<Author, 'id' | 'name'>[] | null = null

  for (const [index, item] of items.entries()) {
    const book = await deps.getBook(item.bookId)
    // Deleted since it was scanned
    if (!book) continue

    let result: BookLookupResult | null
    try {
      result = await deps.lookup(item.isbn)
    } catch (error) {
      // Still offline, or the services are down: try them all again later
      if (
        error instanceof LookupOfflineError ||
        error instanceof LookupUnavailableError
      ) {
        remaining.push(...items.slice(index))
        break
      }
      remaining.push(item)
      continue
    }
    if (!result) continue

    authors ??= await deps.getAuthors()
    const patch = bookPatchFromLookup(result, book, authors, {
      onlyEmpty: true,
    })
    // The placeholder title counts as empty
    if (book.title === item.placeholderTitle && result.title) {
      patch.title = result.title
    }
    await deps.updateBook(book.id, patch)
    if (!book.coverSrc && result.coverUrl && deps.downloadCover) {
      try {
        await deps.downloadCover(book.id, result.coverUrl)
      } catch {
        // The details are in; a missing cover is not worth retrying
      }
    }
    filled.push(patch.title ?? book.title)
  }

  return { filled, remaining }
}
