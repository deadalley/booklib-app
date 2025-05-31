import type { Author } from '~/types/author'
import type { BookProgressStatus, ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'
import { sum, uniq } from 'ramda'

export function getBooksByAuthor(books: ViewBook[], authors: Author[]) {
  return authors.reduce<Record<string, ViewBook[]>>(
    (authorBooks, author) => ({
      ...authorBooks,
      [author.id]: books.filter((book) => book.author === author.id),
    }),
    {},
  )
}

export function getBooksByCollection(
  books: ViewBook[],
  collections: Collection[],
  authors: Author[],
) {
  return collections.reduce<Record<string, ViewBook[]>>(
    (collectionBooks, collection) => ({
      ...collectionBooks,
      [collection.id]: (books ?? [])
        .filter((book) => collection.books.some(({ id }) => id === book.id))
        .map((book) => ({
          ...book,
          order: collection.books.find(({ id }) => id === book.id)?.order,
          authorName: authors.find(({ id }) => id === book.author)?.name,
        })),
    }),
    {},
  )
}

export function getBooksByLanguage(
  books: ViewBook[],
  property: 'language' | 'originalLanguage',
) {
  return Object.keys(languageOptions).reduce<Record<string, ViewBook[]>>(
    (booksByLanguage, key) => {
      const booksForLanguage = books.filter((book) => book[property] === key)

      if (booksForLanguage.length) {
        return {
          ...booksByLanguage,
          [key]: booksForLanguage,
        }
      }

      return booksByLanguage
    },
    {},
  )
}

export function getBooksByPublisher(books: ViewBook[]) {
  return books.reduce<Record<string, ViewBook[]>>(
    (publisherBooks, book) => ({
      ...publisherBooks,
      ...(book.publisher
        ? {
            [book.publisher]: (publisherBooks[book.publisher] || []).concat(
              book,
            ),
          }
        : {}),
    }),
    {},
  )
}

export function getBooksByGenre(books: ViewBook[]) {
  const genres = uniq(
    books.flatMap((book) => book.genres).filter((v): v is string => !!v),
  )

  return genres.reduce<Record<string, ViewBook[]>>((booksByGenre, genre) => {
    const booksForGenre = books.filter((book) => book.genres?.includes(genre))

    if (booksForGenre.length) {
      return {
        ...booksByGenre,
        [genre]: booksForGenre,
      }
    }

    return booksByGenre
  }, {})
}

export function getBooksByFormat(books: ViewBook[]) {
  return books.reduce<Record<string, ViewBook[]>>(
    (formatBooks, book) => ({
      ...formatBooks,
      ...(book.bookFormat
        ? {
            [book.bookFormat]: (formatBooks[book.bookFormat] || []).concat(
              book,
            ),
          }
        : {}),
    }),
    {},
  )
}

export function getAverageRating(books: ViewBook[]): number | undefined {
  const booksWithValidRatings = books
    .filter((book) => book.rating !== null)
    .map((book) => book.rating ?? 0)

  if (!booksWithValidRatings.length) {
    return undefined
  }

  return roundToNearestHalf(
    sum(booksWithValidRatings) / booksWithValidRatings.length,
  )
}

export function getBooksByStatus(
  books: ViewBook[],
): Record<BookProgressStatus, number> {
  return PROGRESS_STATUS.reduce(
    (acc, currentStatus) => {
      return {
        ...acc,
        [currentStatus]: books.filter(
          (book) => book.progressStatus === currentStatus,
        ).length,
      }
    },
    {
      owned: 0,
      'not-owned': 0,
      'not-read': 0,
      reading: 0,
      paused: 0,
      read: 0,
      'not-finished': 0,
    },
  )
}
