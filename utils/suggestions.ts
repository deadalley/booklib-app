import dayjs from 'dayjs'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'
import { toSimpleDate } from './date'
import { getGoalStatus, getUnloggedGoalBooks, resolveGoal } from './goal'

export type SuggestionKind = 'almost' | 'log' | 'author' | 'old'

export type SuggestionAction =
  | { type: 'open'; bookId: string }
  | { type: 'start'; bookId: string }
  | { type: 'log'; goalId: string; bookId: string }

export type Suggestion = {
  id: string
  kind: SuggestionKind
  eyebrow: string
  title: string
  body: string
  cta: string
  book: Book
  // "almost" only: how far through the book the reader is
  progress?: number
  action: SuggestionAction
}

const KIND_ORDER: SuggestionKind[] = ['almost', 'log', 'author', 'old']

/** Pages read so far: every page once read, otherwise the logged page. */
export function getBookPagesRead(book: Book): number {
  const pages = book.pages ?? 0
  if (book.progress.status === 'read') return pages
  return Math.min(pages, book.progress.currentPage ?? 0)
}

/** Reading progress as a whole percentage (0 without a page count). */
export function getBookPercentage(book: Book): number {
  if (!book.pages) return 0
  return Math.min(
    100,
    Math.round((getBookPagesRead(book) / book.pages) * 100),
  )
}

/** The local calendar day (`YYYY-MM-DD`) of a timestamp. */
export function toLocalDay(date: string): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/** Whole calendar days from `from` to `today` (both `YYYY-MM-DD`). */
export function daysSince(from: string, today: string): number {
  return dayjs(today).diff(dayjs(from), 'day')
}

const plural = (count: number, unit: string) =>
  `${count} ${unit}${count === 1 ? '' : 's'}`

/** "today", "yesterday", "N days ago", "N months ago" or "N years ago". */
export function formatRelativeDay(
  from: string,
  today: string,
  { suffix = true }: { suffix?: boolean } = {},
): string {
  const days = daysSince(from, today)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'

  let span: string
  if (days < 30) span = plural(days, 'day')
  else if (days < 365) span = plural(Math.max(1, Math.round(days / 30)), 'month')
  else span = plural(Math.max(1, Math.round(days / 365)), 'year')

  return suffix ? `${span} ago` : span
}

export function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const byCreatedAt = (a: Book, b: Book) => a.createdAt.localeCompare(b.createdAt)

function almostFinished(books: Book[]): Suggestion[] {
  return books
    .filter((book) => book.progress.status === 'reading' && !!book.pages)
    .map((book) => ({ book, progress: getBookPercentage(book) }))
    .filter(({ progress }) => progress >= 60 && progress < 100)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 2)
    .map(({ book, progress }): Suggestion => ({
      id: `almost-${book.id}`,
      kind: 'almost',
      eyebrow: 'Almost there',
      title: `You’re almost finishing ${book.title}!`,
      body: `${Math.max(0, (book.pages ?? 0) - getBookPagesRead(book))} pages left. You’re ${progress}% of the way through.`,
      cta: 'Continue reading',
      book,
      progress,
      action: { type: 'open', bookId: book.id },
    }))
}

function unloggedGoalBooks(
  books: Book[],
  goals: Goal[],
  today: string,
): Suggestion[] {
  return goals
    .map((goal) => resolveGoal(goal, books))
    .filter(
      (goal) =>
        goal.type === 'books' &&
        !goal.auto &&
        getGoalStatus(goal, today) === 'tracking',
    )
    .flatMap((goal) => {
      const book = getUnloggedGoalBooks(goal, books)[0]
      if (!book) return []
      const finished = toSimpleDate(book.progress.finishedAt!)
      return [
        {
          id: `log-${goal.id}-${book.id}`,
          kind: 'log',
          eyebrow: 'Goal',
          title: `Log ${book.title} for your goal “${goal.title}”`,
          body: `You finished it ${formatRelativeDay(finished, today)}, but it isn’t counted yet.`,
          cta: 'Log book',
          book,
          action: { type: 'log', goalId: goal.id, bookId: book.id },
        } satisfies Suggestion,
      ]
    })
}

function favouriteAuthor(books: Book[], authors: Author[]): Suggestion[] {
  const byAuthor = new Map<string, Book[]>()
  books.forEach((book) => {
    if (!book.author) return
    byAuthor.set(book.author, [...(byAuthor.get(book.author) ?? []), book])
  })

  const best = [...byAuthor.entries()]
    .map(([authorId, authorBooks]) => {
      const read = authorBooks.filter(
        ({ progress }) => progress.status === 'read',
      )
      const rated = read.filter(({ rating }) => rating != null)
      const unread = authorBooks
        .filter(({ progress }) => !progress.status)
        .sort(byCreatedAt)
      const average = rated.length
        ? rated.reduce((total, { rating }) => total + rating!, 0) /
          rated.length
        : null
      return { authorId, read, unread, average }
    })
    // "You rated their books…" needs at least one rating to be true
    .filter(
      ({ read, unread, average }) =>
        read.length > 0 && unread.length > 0 && average !== null,
    )
    .sort((a, b) => b.average! - a.average!)[0]

  if (!best) return []
  const author = authors.find(({ id }) => id === best.authorId)
  const book = best.unread[0]!

  return [
    {
      id: `author-${best.authorId}-${book.id}`,
      kind: 'author',
      eyebrow: 'From an author you like',
      title: `How about a book from ${author?.name ?? 'this author'}?`,
      body: `You rated their books ${best.average!.toFixed(1)} ★ on average. ${book.title} is waiting on your shelf.`,
      cta: 'Open book',
      book,
      action: { type: 'open', bookId: book.id },
    },
  ]
}

function longOnShelf(
  books: Book[],
  authors: Author[],
  today: string,
): Suggestion[] {
  return books
    .filter((book) => !book.progress.status && !!book.createdAt)
    .sort(byCreatedAt)
    .slice(0, 2)
    .map((book): Suggestion => {
      const since = formatRelativeDay(toLocalDay(book.createdAt), today, {
        suffix: false,
      })
      const author = authors.find(({ id }) => id === book.author)?.name
      return {
        id: `old-${book.id}`,
        kind: 'old',
        eyebrow: 'On your shelf',
        title:
          since === 'today' || since === 'yesterday'
            ? `${book.title} was added ${since}. How about giving it a try?`
            : `${book.title} has been in your library for ${since}. How about giving it a try?`,
        body: [author, book.pages && `${book.pages} pages`, book.genres?.[0]]
          .filter(Boolean)
          .join(' · '),
        cta: 'Start reading',
        book,
        action: { type: 'start', bookId: book.id },
      }
    })
}

/**
 * Contextual nudges for the home carousel, in display order: books close to
 * the end, finished books a manual goal hasn't logged, an unread book from
 * the best-rated author, and the books waiting longest on the shelf.
 */
export function buildSuggestions({
  books,
  authors,
  goals,
  today,
}: {
  books: Book[]
  authors: Author[]
  goals: Goal[]
  today: string
}): Suggestion[] {
  return [
    ...almostFinished(books),
    ...unloggedGoalBooks(books, goals, today),
    ...favouriteAuthor(books, authors),
    ...longOnShelf(books, authors, today),
  ].sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
}

const DAY_MS = 24 * 60 * 60 * 1000
export const SUGGESTION_SNOOZE_DAYS = 14

/** Dismissals (id → expiry timestamp) that haven't expired yet. */
export function activeDismissals(
  dismissed: Record<string, number>,
  now: number,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(dismissed).filter(([, until]) => until > now),
  )
}

export function snoozeUntil(now: number): number {
  return now + SUGGESTION_SNOOZE_DAYS * DAY_MS
}
