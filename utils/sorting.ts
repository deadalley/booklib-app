import { indexBy, prop } from 'ramda'
import type { Author } from '~/types/author'
import type { Book, BookProgressStatus, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal, GoalStatus } from '~/types/goal'

export function sortBooksByOrder(booksToBeSorted: ViewBook[]) {
  return booksToBeSorted.concat().sort((book1, book2) => {
    if (book1.order !== undefined && book2.order !== undefined) {
      return book1.order - book2.order
    }
    return book1.title.localeCompare(book2.title, undefined, { numeric: true })
  })
}

export function sortBooksBy<B extends Book>(
  books: B[],
  bookProperty: keyof B,
  direction: 'asc' | 'desc' = 'asc',
  count?: number,
) {
  const sortedBooks = books.concat().sort((book1, book2) => {
    if (book1[bookProperty] === null) {
      return 1
    }

    if (book2[bookProperty] === null) {
      return -1
    }

    if (
      typeof book1[bookProperty] === 'string' &&
      typeof book2[bookProperty] === 'string'
    ) {
      return direction === 'desc'
        ? book2[bookProperty].localeCompare(book1[bookProperty], undefined, {
            numeric: true,
          })
        : book1[bookProperty].localeCompare(book2[bookProperty], undefined, {
            numeric: true,
          })
    }

    const val1 = book1[bookProperty]
    const val2 = book2[bookProperty]
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return direction === 'desc' ? val2 - val1 : val1 - val2
    }

    return 0
  })

  return count ? sortedBooks.slice(0, count) : sortedBooks
}

export function sortBooksByAuthor(books: ViewBook[]) {
  return books.concat().sort((b1, b2) => {
    if (b1.authorName === b2.authorName) {
      return b1.title.localeCompare(b2.title, undefined, { numeric: true })
    }

    if (b1.authorName && !b2.authorName) {
      return -1
    }

    if (!b1.authorName && b2.authorName) {
      return 1
    }

    return b1.authorName!.localeCompare(b2.authorName!, undefined, {
      numeric: true,
    })
  })
}

export function sortCollections(collections: Collection[]) {
  return collections.concat().sort((b1, b2) => {
    const isB1Favorite = DEFAULT_COLLECTIONS.includes(String(b1.id))
    const isB2Favorite = DEFAULT_COLLECTIONS.includes(String(b2.id))

    if (isB1Favorite && isB2Favorite) {
      return b1.name.localeCompare(b2.name, undefined, { numeric: true })
    }

    if (isB1Favorite) {
      return -1
    }

    if (isB2Favorite) {
      return 1
    }

    return b1.name.localeCompare(b2.name, undefined, { numeric: true })
  })
}

export function sortGoals(goals: Goal[]) {
  const goalSortingOrder: Record<GoalStatus, number> = {
    tracking: 0,
    finished: 1,
    expired: 2,
    'not-tracking': 3,
  }

  return goals.concat().sort((g1, g2) => {
    return goalSortingOrder[g1.status] - goalSortingOrder[g2.status]
  })
}

export function sortAuthorsByBookCount(
  books: ViewBook[],
  authors: Author[],
): { author: Author; count: number }[] {
  const authorsById = indexBy(prop('id'), authors)
  const booksByAuthor = getBooksByAuthor(books, authors)
  const authorCounts = Object.keys(booksByAuthor)
    .map((authorId) => ({
      author: authorsById[authorId],
      count: booksByAuthor[authorId].length,
    }))
    .filter(({ count }) => count > 0)

  return authorCounts.sort((a, b) => {
    if (a.count === b.count) {
      return a.author.name.localeCompare(b.author.name)
    }
    return b.count - a.count
  })
}

export function sortAuthorsByBookRatings(
  books: ViewBook[],
  authors: Author[],
  minAverage: number = 0.5,
): { author: Author; count: number; average: number }[] {
  const authorsById = indexBy(prop('id'), authors)
  const booksByAuthor = getBooksByAuthor(books, authors)
  const authorCounts = Object.keys(booksByAuthor)
    .map((authorId) => ({
      author: authorsById[authorId],
      count: booksByAuthor[authorId].length,
      average: getAverageRating(booksByAuthor[authorId]),
    }))
    .filter(
      (a): a is { author: Author; count: number; average: number } =>
        a.average !== undefined && a.average >= minAverage,
    )

  return authorCounts.sort((a, b) => {
    if (a.average === b.average) {
      if (a.count === b.count) {
        return a.author.name.localeCompare(b.author.name)
      }
      return b.count - a.count
    }

    return b.average - a.average
  })
}

export function sortAuthorByStatusesCount(
  books: ViewBook[],
  authors: Author[],
): {
  author: Author
  count: number
  countByStatus?: Record<BookProgressStatus, number>
}[] {
  const authorsById = indexBy(prop('id'), authors)
  const booksByAuthor = getBooksByAuthor(books, authors)
  const authorCounts = Object.keys(booksByAuthor)
    .map((authorId) => ({
      author: authorsById[authorId],
      count: booksByAuthor[authorId].length,
      countByStatus: getBooksByStatus(booksByAuthor[authorId]),
    }))
    .filter(({ count }) => count > 0)

  return authorCounts
}
