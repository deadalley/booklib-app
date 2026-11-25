import { slugify } from '~/utils/string'
import { emptyBookRecord, type BookRecord } from './schema'

/*
 * A shared reading list: a collection's books in a file someone else can
 * import into their own BookLib. Only what describes the book travels;
 * the sender's ratings, progress, notes and dates stay in their library.
 */

// Byte-order mark some apps put before UTF-8 text
const BOM = new RegExp('^\\uFEFF')

export const LIST_FORMAT = 'booklib-list'
export const LIST_VERSION = 1
export const LIST_EXTENSION = '.booklib-list.json'

export type SharedListFile = {
  format: typeof LIST_FORMAT
  version: number
  name: string
  exportedAt: string
  books: BookRecord[]
}

// Covers stored on this device (desktop files, data URLs) can't be opened
// elsewhere; links to the web can
const isWebUrl = (src: string | null) => !!src && /^https?:\/\//i.test(src)

/** The record without the sender's own reading data. */
export function toSharedRecord(record: BookRecord): BookRecord {
  return {
    ...emptyBookRecord(record.title),
    author: record.author,
    originalTitle: record.originalTitle,
    publisher: record.publisher,
    language: record.language,
    originalLanguage: record.originalLanguage,
    year: record.year,
    pages: record.pages,
    isbn: record.isbn,
    summary: record.summary,
    genres: [...record.genres],
    format: record.format,
    coverSrc: isWebUrl(record.coverSrc) ? record.coverSrc : null,
  }
}

export function serializeList(
  name: string,
  records: BookRecord[],
  exportedAt = new Date().toISOString(),
): string {
  const file: SharedListFile = {
    format: LIST_FORMAT,
    version: LIST_VERSION,
    name: name.trim(),
    exportedAt,
    books: records.map(toSharedRecord),
  }
  return JSON.stringify(file, null, 2)
}

export function listFileName(name: string) {
  return `${slugify(name)}${LIST_EXTENSION}`
}

export type SharedListInfo =
  | { ok: true; name: string }
  | { ok: false; error: string }

/**
 * Whether the text is a shared list, and its name. Returns null for any
 * other file, which is then read as plain books.
 */
export function readSharedList(text: string): SharedListInfo | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text.replace(BOM, ''))
  } catch {
    return null
  }
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { format?: unknown }).format !== LIST_FORMAT
  ) {
    return null
  }
  const { version, name } = parsed as { version?: unknown; name?: unknown }
  if (typeof version === 'number' && version > LIST_VERSION) {
    return {
      ok: false,
      error: `This list was made by a newer version of BookLib (format v${version})`,
    }
  }
  const trimmed = typeof name === 'string' ? name.trim() : ''
  return { ok: true, name: trimmed || 'Shared list' }
}

/** "Fantasy", taken → "Fantasy (2)", then "Fantasy (3)"… */
export function uniqueCollectionName(name: string, taken: string[]) {
  const names = new Set(taken.map((n) => n.trim().toLowerCase()))
  if (!names.has(name.toLowerCase())) return name
  let n = 2
  while (names.has(`${name} (${n})`.toLowerCase())) n++
  return `${name} (${n})`
}
