import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { parseCsv, serializeCsv } from './formats/csv'
import { parseJson, serializeJson } from './formats/json'
import { normalizeRows } from './normalize'
import {
  emptyBookRecord,
  type BookRecord,
  type TransferFormat,
  type TransferIssue,
} from './schema'

export * from './schema'
export { normalizeRows } from './normalize'
export { parseCsv, serializeCsv } from './formats/csv'
export { parseJson, serializeJson } from './formats/json'

export type ParseResult = {
  records: BookRecord[]
  issues: TransferIssue[]
  /** Source row (1-based) of each record. */
  rows: number[]
}

/** Infers the transfer format from a file name. */
export function formatFromFileName(name: string): TransferFormat | null {
  const extension = name.toLowerCase().split('.').pop()
  if (extension === 'csv') return 'csv'
  if (extension === 'json') return 'json'
  return null
}

/** Parses and validates file contents into `BookRecord`s. Never throws. */
export function parseBookFile(
  text: string,
  format: TransferFormat,
): ParseResult {
  const { rows, errors } = format === 'csv' ? parseCsv(text) : parseJson(text)
  const fileIssues: TransferIssue[] = errors.map((message) => ({
    row: 0,
    message,
    severity: 'error',
  }))
  if (!rows.length && !errors.length) {
    fileIssues.push({
      row: 0,
      message: 'The file contains no books',
      severity: 'error',
    })
  }
  const result = normalizeRows(rows)
  return { ...result, issues: [...fileIssues, ...result.issues] }
}

export function serializeBooks(records: BookRecord[], format: TransferFormat) {
  return format === 'csv' ? serializeCsv(records) : serializeJson(records)
}

// ─── Model conversion ────────────────────────────────────────────────────────

/** Converts a library book to a portable record (author by name). */
export function bookToRecord(
  book: Book,
  authorsById: Map<string, Author> | Record<string, Author>,
): BookRecord {
  const authorName = book.author
    ? authorsById instanceof Map
      ? authorsById.get(book.author)?.name
      : authorsById[book.author]?.name
    : null
  return {
    ...emptyBookRecord(book.title),
    author: authorName ?? null,
    originalTitle: book.originalTitle,
    publisher: book.publisher,
    language: book.language,
    originalLanguage: book.originalLanguage,
    year: book.year,
    pages: book.pages,
    isbn: book.isbn,
    rating: book.rating,
    summary: book.summary,
    genres: book.genres ?? [],
    format: book.format,
    propertyStatus: book.propertyStatus,
    coverSrc: book.coverSrc,
    createdAt: book.createdAt || null,
    progress: {
      status: book.progress.status,
      startedAt: book.progress.startedAt,
      finishedAt: book.progress.finishedAt,
      currentPage: book.progress.currentPage ?? null,
      notes: book.progress.notes ?? [],
    },
  }
}

/**
 * Converts a record to a new (unsaved) library book. `author` holds the author
 * **name**; the data service resolves it to an existing or new author.
 */
export function recordToBook(record: BookRecord, id: string): Book {
  return {
    id,
    title: record.title,
    author: record.author,
    coverSrc: record.coverSrc,
    createdAt: record.createdAt ?? '',
    isbn: record.isbn,
    language: record.language,
    originalTitle: record.originalTitle,
    originalLanguage: record.originalLanguage,
    pages: record.pages,
    publisher: record.publisher,
    rating: record.rating,
    summary: record.summary,
    year: record.year,
    genres: record.genres,
    collections: [],
    format: record.format,
    propertyStatus: record.propertyStatus,
    progress: {
      status: record.progress.status,
      startedAt: record.progress.startedAt,
      finishedAt: record.progress.finishedAt,
      currentPage: record.progress.currentPage,
      notes: record.progress.notes,
    },
  }
}

// ─── Import planning ─────────────────────────────────────────────────────────

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeIsbn(value: string | null | undefined): string {
  return (value ?? '').replace(/[^0-9xX]/g, '').toUpperCase()
}

export type PlannedImport = {
  record: BookRecord
  /** Title of the existing (or earlier imported) book this one duplicates. */
  duplicateOf: string | null
}

export type ImportPlan = {
  items: PlannedImport[]
  /** Author names that do not exist yet and will be created. */
  newAuthors: string[]
}

/**
 * Prepares records for import: flags likely duplicates (same ISBN, or same
 * title + author) against the library and within the file, and lists the
 * authors that will be created. Existing authors are matched by name.
 */
export function planImport(
  records: BookRecord[],
  library: { books: Book[]; authors: Author[] },
): ImportPlan {
  const authorNames = new Map(
    library.authors.map((author) => [normalizeText(author.name), author]),
  )
  const authorById = new Map(library.authors.map((a) => [a.id, a]))

  const byIsbn = new Map<string, string>()
  const byTitleAuthor = new Map<string, string>()
  const remember = (
    title: string,
    author: string | null,
    isbn: string | null,
  ) => {
    const isbnKey = normalizeIsbn(isbn)
    if (isbnKey) byIsbn.set(isbnKey, title)
    byTitleAuthor.set(`${normalizeText(title)}|${normalizeText(author)}`, title)
  }
  for (const book of library.books) {
    const author = book.author
      ? (authorById.get(book.author)?.name ?? null)
      : null
    remember(book.title, author, book.isbn)
  }

  const newAuthors = new Map<string, string>()
  const items = records.map((record) => {
    const isbnKey = normalizeIsbn(record.isbn)
    const duplicateOf =
      (isbnKey && byIsbn.get(isbnKey)) ||
      byTitleAuthor.get(
        `${normalizeText(record.title)}|${normalizeText(record.author)}`,
      ) ||
      null
    remember(record.title, record.author, record.isbn)

    const authorKey = normalizeText(record.author)
    if (
      authorKey &&
      !authorNames.has(authorKey) &&
      !newAuthors.has(authorKey)
    ) {
      newAuthors.set(authorKey, record.author!.trim())
    }
    return { record, duplicateOf }
  })

  return { items, newAuthors: [...newAuthors.values()] }
}
