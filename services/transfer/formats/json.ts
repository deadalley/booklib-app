import {
  TRANSFER_FORMAT,
  TRANSFER_VERSION,
  type BookRecord,
  type BookRecordFile,
} from '../schema'
import type { RawRow } from '../normalize'
import type { ParsedRows } from './csv'

/** Byte-order mark some spreadsheet apps prepend to UTF-8 files. */
const BOM = new RegExp('^\\uFEFF')

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Raw database dumps (the "Backup" export) store books in snake_case with an
 * `author_id` that points into a separate `authors` table. Replace the id with
 * the author's name so the row can be read like any other source.
 */
function resolveDatabaseAuthors(books: unknown[], authors: unknown): RawRow[] {
  const names = new Map<string, string>()
  if (Array.isArray(authors)) {
    for (const author of authors) {
      if (isObject(author) && typeof author.id === 'string') {
        names.set(author.id, String(author.name ?? ''))
      }
    }
  }
  return books.map((book) => {
    if (!isObject(book)) return book as RawRow
    const { author_id: authorId, ...rest } = book
    if (rest.author === undefined && typeof authorId === 'string') {
      return { ...rest, author: names.get(authorId) ?? null }
    }
    return rest
  })
}

/**
 * Parses JSON exports. Supported shapes:
 * - BookLib export: `{ format: 'booklib', version, books: BookRecord[] }`
 * - BookLib backup / database dump: `{ books: BookDB[], authors: AuthorDB[] }`
 * - Legacy / template files: `{ books: [...] }`
 * - A bare array of books
 */
export function parseJson(text: string): ParsedRows {
  let parsed: unknown
  try {
    parsed = JSON.parse(text.replace(BOM, ''))
  } catch {
    return { rows: [], errors: ['The file is not valid JSON'] }
  }

  if (Array.isArray(parsed)) {
    return { rows: parsed as RawRow[], errors: [] }
  }

  if (isObject(parsed) && Array.isArray(parsed.books)) {
    if (
      parsed.format === TRANSFER_FORMAT &&
      typeof parsed.version === 'number' &&
      parsed.version > TRANSFER_VERSION
    ) {
      return {
        rows: [],
        errors: [
          `This file was created by a newer version of BookLib (format v${parsed.version})`,
        ],
      }
    }
    const rows =
      'authors' in parsed
        ? resolveDatabaseAuthors(parsed.books, parsed.authors)
        : (parsed.books as RawRow[])
    return { rows, errors: [] }
  }

  return {
    rows: [],
    errors: ['Invalid JSON structure: expected an object with a "books" list'],
  }
}

export function serializeJson(
  records: BookRecord[],
  exportedAt = new Date().toISOString(),
): string {
  const file: BookRecordFile = {
    format: TRANSFER_FORMAT,
    version: TRANSFER_VERSION,
    exportedAt,
    books: records,
  }
  return JSON.stringify(file, null, 2)
}
