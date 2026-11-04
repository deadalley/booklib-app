import type { Book } from '~/types/book'

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
