import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import { normalizeForMatch } from '~/utils/filters'

/*
 * Book details for an ISBN, from Open Library and Google Books. Both are
 * free, need no key and allow requests from the browser. Open Library is
 * asked first for the bibliographic fields; Google Books fills the gaps and
 * adds the summary, language and categories.
 */

export type BookLookupResult = {
  isbn: string
  title: string | null
  author: string | null
  publisher: string | null
  year: number | null
  pages: number | null
  // An ISO 639-1 code, e.g. "en"
  language: string | null
  summary: string | null
  genres: string[]
  coverUrl: string | null
}

/** The device is offline, or neither service could be reached */
export class LookupOfflineError extends Error {
  constructor() {
    super('Book lookup is unavailable offline')
    this.name = 'LookupOfflineError'
  }
}

/**
 * The device is online but the lookup could not be completed: a service
 * could not be reached (blocked, down) or turned the request away (rate
 * limited). Unlike a book that isn't found, this is worth retrying.
 */
export class LookupUnavailableError extends Error {
  constructor(
    // busy: a service answered with an error, e.g. too many requests
    readonly reason: 'unreachable' | 'busy',
  ) {
    super(
      reason === 'busy'
        ? 'The book services are busy'
        : 'The book services could not be reached',
    )
    this.name = 'LookupUnavailableError'
  }
}

/** A service answered with an error status (not "not found") */
class ServiceError extends Error {
  constructor(readonly status: number) {
    super(`Lookup service answered ${status}`)
  }
}

type Fetch = typeof fetch

type OpenLibraryBook = {
  title?: string
  authors?: { name?: string }[]
  publishers?: { name?: string }[]
  publish_date?: string
  number_of_pages?: number
  cover?: { small?: string; medium?: string; large?: string }
}

type GoogleVolume = {
  title?: string
  authors?: string[]
  publisher?: string
  publishedDate?: string
  pageCount?: number
  description?: string
  language?: string
  categories?: string[]
  imageLinks?: { thumbnail?: string; smallThumbnail?: string }
}

const OPEN_LIBRARY_URL = 'https://openlibrary.org/api/books'
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes'

async function getJson<T>(fetchFn: Fetch, url: string): Promise<T | null> {
  const response = await fetchFn(url, {
    headers: { Accept: 'application/json' },
  })
  if (response.status === 404) return null
  // Rate limited or failing: worth trying again later
  if (!response.ok) throw new ServiceError(response.status)
  return (await response.json()) as T
}

async function fromOpenLibrary(fetchFn: Fetch, isbn: string) {
  const key = `ISBN:${isbn}`
  const data = await getJson<Record<string, OpenLibraryBook>>(
    fetchFn,
    `${OPEN_LIBRARY_URL}?bibkeys=${key}&format=json&jscmd=data`,
  )
  return data?.[key] ?? null
}

async function fromGoogleBooks(fetchFn: Fetch, isbn: string) {
  const data = await getJson<{ items?: { volumeInfo?: GoogleVolume }[] }>(
    fetchFn,
    `${GOOGLE_BOOKS_URL}?q=isbn:${isbn}`,
  )
  return data?.items?.[0]?.volumeInfo ?? null
}

const text = (value: string | null | undefined) => value?.trim() || null

function parseYear(date: string | undefined): number | null {
  const match = date?.match(/\b(\d{4})\b/)
  return match ? Number(match[1]) : null
}

function stripHtml(html: string | undefined): string | null {
  if (!html) return null
  return text(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/\n{3,}/g, '\n\n'),
  )
}

/** "Fiction / Science Fiction / General" → "Science Fiction" */
function categoryToGenre(category: string): string | null {
  const parts = category
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part && part.toLowerCase() !== 'general')
  return parts.at(-1) ?? null
}

function googleCover(links: GoogleVolume['imageLinks']): string | null {
  const url = links?.thumbnail ?? links?.smallThumbnail
  return url ? url.replace(/^http:/, 'https:').replace(/&edge=curl/, '') : null
}

export function mergeLookup(
  isbn: string,
  openLibrary: OpenLibraryBook | null,
  google: GoogleVolume | null,
): BookLookupResult | null {
  if (!openLibrary && !google) return null

  const result: BookLookupResult = {
    isbn,
    title: text(openLibrary?.title) ?? text(google?.title),
    author: text(openLibrary?.authors?.[0]?.name) ?? text(google?.authors?.[0]),
    publisher:
      text(openLibrary?.publishers?.[0]?.name) ?? text(google?.publisher),
    year:
      parseYear(openLibrary?.publish_date) ?? parseYear(google?.publishedDate),
    pages: openLibrary?.number_of_pages || google?.pageCount || null,
    language: text(google?.language),
    summary: stripHtml(google?.description),
    genres: [
      ...new Set(
        (google?.categories ?? [])
          .map(categoryToGenre)
          .filter((genre): genre is string => !!genre),
      ),
    ],
    coverUrl:
      openLibrary?.cover?.large ??
      openLibrary?.cover?.medium ??
      googleCover(google?.imageLinks),
  }

  return result.title ? result : null
}

/**
 * The book for an ISBN-13, or null when neither service knows it.
 * Throws LookupOfflineError when offline or when neither can be reached.
 */
export async function lookupIsbn(
  isbn: string,
  fetchFn: Fetch = (...args) => fetch(...args),
): Promise<BookLookupResult | null> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new LookupOfflineError()
  }

  const [openLibrary, google] = await Promise.allSettled([
    fromOpenLibrary(fetchFn, isbn),
    fromGoogleBooks(fetchFn, isbn),
  ])
  const result = mergeLookup(
    isbn,
    openLibrary.status === 'fulfilled' ? openLibrary.value : null,
    google.status === 'fulfilled' ? google.value : null,
  )
  if (result) return result

  // Nothing found, but only "not found" if every service could answer
  const failures = [openLibrary, google].flatMap((outcome) =>
    outcome.status === 'rejected' ? [outcome.reason] : [],
  )
  if (!failures.length) return null
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new LookupOfflineError()
  }
  throw new LookupUnavailableError(
    failures.some((failure) => failure instanceof ServiceError)
      ? 'busy'
      : 'unreachable',
  )
}

const isEmpty = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

/**
 * The fields to set on `book` from a lookup. The author becomes an existing
 * author's id when the name matches, else the name (created when saved).
 * With `onlyEmpty`, fields the book already has are left alone.
 */
export function bookPatchFromLookup(
  result: BookLookupResult,
  book: Partial<Book>,
  authors: Pick<Author, 'id' | 'name'>[],
  { onlyEmpty = false }: { onlyEmpty?: boolean } = {},
): Partial<Book> {
  const author = result.author
    ? (authors.find(
        ({ name }) =>
          normalizeForMatch(name) === normalizeForMatch(result.author!),
      )?.id ?? result.author)
    : null

  const values: Partial<Book> = {
    isbn: result.isbn,
    title: result.title ?? undefined,
    author,
    publisher: result.publisher,
    year: result.year,
    pages: result.pages,
    language: result.language,
    summary: result.summary,
    genres: result.genres,
  }

  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) =>
        !isEmpty(value) &&
        (!onlyEmpty || isEmpty(book[key as keyof Book]) || key === 'isbn'),
    ),
  ) as Partial<Book>
}
