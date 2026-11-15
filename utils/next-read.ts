import type { Book, BookFormat } from '~/types/book'
import { daysSince, formatRelativeDay, toLocalDay } from './suggestions'

/*
 * "What should I read next?": picks an unstarted book, either at random or
 * weighted towards the top of the To Be Read queue, authors the reader rates
 * highly and books that have waited longest.
 */

export type BookLength = 'any' | 'short' | 'medium' | 'long'

export const BOOK_LENGTHS: Record<
  Exclude<BookLength, 'any'>,
  { label: string; min: number; max: number }
> = {
  short: { label: 'Under 250 pages', min: 0, max: 249 },
  medium: { label: '250–450 pages', min: 250, max: 450 },
  long: { label: 'Over 450 pages', min: 451, max: Infinity },
}

export type NextReadFilters = {
  genre?: string | null
  format?: BookFormat | null
  authorId?: string | null
  length?: BookLength
}

export type NextReadMode = 'weighted' | 'random'

export type NextReadContext = {
  // To Be Read book ids, in priority order
  tbrIds: string[]
  // Every book in the library, for the reader's author ratings
  library: Book[]
  today: string
}

export type NextReadPick = { book: Book; reasons: string[] }

/** Books not started yet */
export const isUnstarted = (book: Book) => !book.progress.status

export function filterNextReads(books: Book[], filters: NextReadFilters) {
  const length =
    filters.length && filters.length !== 'any'
      ? BOOK_LENGTHS[filters.length]
      : null
  return books.filter(
    (book) =>
      isUnstarted(book) &&
      (!filters.genre || !!book.genres?.includes(filters.genre)) &&
      (!filters.format || book.format === filters.format) &&
      (!filters.authorId || book.author === filters.authorId) &&
      (!length ||
        (!!book.pages && book.pages >= length.min && book.pages <= length.max)),
  )
}

/** Average rating of each author's rated books */
function authorAverages(library: Book[]) {
  const ratings = new Map<string, number[]>()
  for (const { author, rating } of library) {
    if (!author || rating == null) continue
    ratings.set(author, [...(ratings.get(author) ?? []), rating])
  }
  return new Map(
    [...ratings].map(([author, values]) => [
      author,
      values.reduce((sum, value) => sum + value, 0) / values.length,
    ]),
  )
}

/** How much `book` is favoured in a weighted pick, and why */
export function weighNextRead(
  book: Book,
  context: NextReadContext,
  averages = authorAverages(context.library),
): NextReadPick & { weight: number } {
  let weight = 1
  const reasons: string[] = []

  const rank = context.tbrIds.indexOf(book.id)
  if (rank !== -1) {
    // The top of the queue counts most: 4× for #1, fading to 1.5× at the end
    const size = context.tbrIds.length
    weight *= 1.5 + 2.5 * (1 - rank / Math.max(1, size - 1 || 1))
    reasons.push(
      rank === 0 ? 'Top of your To Be Read' : `#${rank + 1} on your To Be Read`,
    )
  }

  const average = book.author ? averages.get(book.author) : undefined
  if (average !== undefined && average >= 3.5) {
    weight *= 1 + (average - 3) / 2
    reasons.push(`By an author you rate ${average.toFixed(1)} ★`)
  }

  if (book.createdAt) {
    const added = toLocalDay(book.createdAt)
    const days = daysSince(added, context.today)
    if (days >= 180) {
      weight *= 1 + Math.min(1, days / 730)
      reasons.push(
        `On your shelf for ${formatRelativeDay(added, context.today, { suffix: false })}`,
      )
    }
  }

  return { book, weight, reasons }
}

/**
 * One book from `candidates`, skipping `exclude` (earlier picks) until every
 * candidate has been offered. `random` is injectable for tests.
 */
export function pickNextRead(
  candidates: Book[],
  context: NextReadContext,
  {
    mode = 'weighted',
    exclude = [],
    random = Math.random,
  }: { mode?: NextReadMode; exclude?: string[]; random?: () => number } = {},
): NextReadPick | null {
  const fresh = candidates.filter(({ id }) => !exclude.includes(id))
  const pool = fresh.length ? fresh : candidates
  if (!pool.length) return null

  const averages = authorAverages(context.library)
  const weighed = pool.map((book) => weighNextRead(book, context, averages))

  if (mode === 'random') {
    const pick = weighed[Math.floor(random() * weighed.length)]!
    return { book: pick.book, reasons: pick.reasons }
  }

  const total = weighed.reduce((sum, { weight }) => sum + weight, 0)
  let target = random() * total
  for (const pick of weighed) {
    target -= pick.weight
    if (target < 0) return { book: pick.book, reasons: pick.reasons }
  }
  const last = weighed.at(-1)!
  return { book: last.book, reasons: last.reasons }
}
