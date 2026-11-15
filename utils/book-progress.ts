import type { Book, BookProgress, BookProgressStatus } from '~/types/book'
import { now } from './date'

/**
 * A book marked as read is finished, whatever its logged page or notes say.
 */
export function isBookFinished(book: Pick<Book, 'progress'>): boolean {
  return book.progress.status === 'read'
}

/**
 * When a read book was finished: its finish date, otherwise its last log
 * entry, otherwise when it was started. Null when it isn't read or no date is
 * known (imported or older books), in which case it still counts as finished
 * but can't be placed in a period.
 */
export function getBookFinishedAt(book: Pick<Book, 'progress'>): string | null {
  if (!isBookFinished(book)) return null
  const { finishedAt, notes, startedAt } = book.progress
  if (finishedAt) return finishedAt

  const lastLog = (notes ?? [])
    .map(({ createdAt }) => createdAt)
    .filter((date) => !!date && !Number.isNaN(Date.parse(date)))
    .sort((a, b) => Date.parse(a) - Date.parse(b))
    .at(-1)
  return lastLog ?? startedAt ?? null
}

/**
 * The progress after changing a book's reading status: finishing (or
 * abandoning) records a finish date, going back to reading clears it,
 * starting records a start date and resetting clears progress.
 */
export function withProgressStatus(
  progress: BookProgress,
  status: BookProgressStatus | null,
  startedAt?: string,
): BookProgress {
  const next: BookProgress = { ...progress, status }

  if (startedAt) next.startedAt = startedAt

  if (status === 'read' || status === 'not-finished') {
    next.finishedAt = progress.finishedAt ?? now()
  } else {
    next.finishedAt = null
  }

  if (status === null) {
    next.startedAt = null
    next.currentPage = null
  } else if (status === 'reading' && !startedAt) {
    next.startedAt = progress.startedAt ?? now()
  }

  return next
}
