import type { BookFormat, BookProgressStatus } from '~/types/book'
import { FAVORITE_COLLECTION_ID, TBR_COLLECTION_ID } from '~/utils/constants'
import type { RawRow } from './normalize'

/*
 * Exports from other reading apps. Their CSV columns and values are turned
 * into BookLib's own columns here, then read like any other file. Shelves
 * that match a default collection (to-read, favourites) come along too.
 */

export type ImportSource = 'booklib' | 'goodreads' | 'storygraph'

export const IMPORT_SOURCE_LABELS: Record<ImportSource, string> = {
  booklib: 'BookLib',
  goodreads: 'Goodreads',
  storygraph: 'The StoryGraph',
}

export type AdaptedRows = {
  rows: RawRow[]
  // Default collections for each row, e.g. To Be Read for "to-read"
  collections: string[][]
}

const has = (headers: Set<string>, ...names: string[]) =>
  names.every((name) => headers.has(name))

export function detectSource(headers: string[]): ImportSource {
  const set = new Set(headers.map((header) => header.trim()))
  if (has(set, 'Book Id', 'Exclusive Shelf')) return 'goodreads'
  if (has(set, 'Read Status', 'Star Rating')) return 'storygraph'
  return 'booklib'
}

const text = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value)

/** Goodreads wraps ISBNs as ="9780441478125" so spreadsheets keep them */
function cleanIsbn(value: unknown) {
  return text(value)
    .replace(/^="?|"$/g, '')
    .trim()
}

const looksLikeIsbn = (value: string) =>
  /^(97[89])?\d{9}[\dX]$/i.test(value.replace(/[\s-]/g, ''))

function formatFrom(value: unknown): BookFormat | '' {
  const binding = text(value).toLowerCase()
  if (!binding) return ''
  if (binding.includes('hardcover') || binding === 'hardback') {
    return 'hardcover'
  }
  if (binding.includes('paperback')) return 'paperback'
  if (/kindle|ebook|e-book|digital|nook|epub/.test(binding)) return 'ebook'
  if (/audio/.test(binding)) return 'audiobook'
  return 'other'
}

const NOT_FINISHED = /^(did-not-finish|dnf|abandoned|not-finished)$/

function statusFrom(shelf: string): BookProgressStatus | '' {
  const value = shelf.toLowerCase()
  if (value === 'read') return 'read'
  if (value === 'currently-reading') return 'reading'
  if (value === 'paused') return 'paused'
  if (NOT_FINISHED.test(value)) return 'not-finished'
  return ''
}

function goodreadsRow(row: RawRow): { row: RawRow; collections: string[] } {
  const shelf = text(row['Exclusive Shelf'])
  const shelves = text(row['Bookshelves'])
    .split(',')
    .map((name) => name.trim().toLowerCase())
  const collections = [
    ...(shelf.toLowerCase() === 'to-read' ? [TBR_COLLECTION_ID] : []),
    ...(shelves.some((name) => /^favou?rites?$/.test(name))
      ? [FAVORITE_COLLECTION_ID]
      : []),
  ]
  return {
    row: {
      title: text(row['Title']),
      author: text(row['Author']),
      isbn: cleanIsbn(row['ISBN13']) || cleanIsbn(row['ISBN']),
      rating: text(row['My Rating']),
      publisher: text(row['Publisher']),
      format: formatFrom(row['Binding']),
      pages: text(row['Number of Pages']),
      year:
        text(row['Original Publication Year']) || text(row['Year Published']),
      progressStatus: statusFrom(shelf),
      finishedAt: text(row['Date Read']),
      createdAt: text(row['Date Added']),
      propertyStatus: Number(text(row['Owned Copies'])) > 0 ? 'owned' : '',
    },
    collections,
  }
}

/** The last "start-end" range of StoryGraph's "Dates Read" */
function lastReading(value: unknown): {
  startedAt: string
  finishedAt: string
} {
  const ranges = text(value)
    .split(',')
    .map((range) => range.trim())
  const [startedAt = '', finishedAt = ''] = (ranges.at(-1) ?? '')
    .split('-')
    .map((date) => date.trim())
  return { startedAt, finishedAt }
}

function storygraphRow(row: RawRow): { row: RawRow; collections: string[] } {
  const status = text(row['Read Status'])
  const reading = lastReading(row['Dates Read'])
  const stars = Number(text(row['Star Rating']))
  const isbn = text(row['ISBN/UID'])
  return {
    row: {
      title: text(row['Title']),
      // "Ursula K. Le Guin, Someone Else": BookLib keeps one author
      author: text(row['Authors']).split(',')[0]?.trim() ?? '',
      isbn: looksLikeIsbn(isbn) ? isbn : '',
      // Quarter stars, rounded to BookLib's half stars
      rating: stars > 0 ? String(Math.round(stars * 2) / 2) : '',
      format: formatFrom(row['Format']),
      progressStatus: statusFrom(status),
      startedAt: reading.startedAt,
      finishedAt: reading.finishedAt || text(row['Last Date Read']),
      createdAt: text(row['Date Added']),
      propertyStatus:
        text(row['Owned?']).toLowerCase() === 'yes' ? 'owned' : '',
    },
    collections: status.toLowerCase() === 'to-read' ? [TBR_COLLECTION_ID] : [],
  }
}

/** BookLib columns for an export's rows; BookLib files pass through */
export function adaptRows(source: ImportSource, rows: RawRow[]): AdaptedRows {
  if (source === 'booklib') return { rows, collections: rows.map(() => []) }
  const adapt = source === 'goodreads' ? goodreadsRow : storygraphRow
  const adapted = rows.map(adapt)
  return {
    rows: adapted.map(({ row }) => row),
    collections: adapted.map(({ collections }) => collections),
  }
}
