import type { Book, ViewBook } from '~/types/book'

export function sortBooks(booksToBeSorted: ViewBook[]) {
  return booksToBeSorted.concat().sort((book1, book2) => {
    if (book1.order !== undefined && book2.order !== undefined) {
      return book1.order - book2.order
    }
    return book1.title.localeCompare(book2.title)
  })
}

export function sortBooksBy<B extends Book>(
  books: B[],
  bookProperty: keyof Pick<B, 'pages' | 'rating'>,
  count?: number,
) {
  const sortedBooks = books.concat().sort((book1, book2) => {
    if (book1[bookProperty] === undefined) {
      return 1
    }

    if (book2[bookProperty] === undefined) {
      return -1
    }

    return book2[bookProperty] - book1[bookProperty]
  })

  return count ? sortedBooks.slice(0, count) : sortedBooks
}
