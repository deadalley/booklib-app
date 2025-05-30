import type { Author } from '~/types/author'
import type { ViewBook } from '~/types/book'
import type { Collection } from '~/types/collection'

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
