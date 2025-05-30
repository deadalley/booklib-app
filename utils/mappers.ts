import type { Author } from '~/types/author'
import type { ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'
import languageOptions from '~/public/languages-2.json'
import { sum } from 'ramda'

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
