import type { ViewBook } from '~/types/book'

export function sortBooks(booksToBeSorted: ViewBook[]) {
  return booksToBeSorted.concat().sort((book1, book2) => {
    if (book1.order !== undefined && book2.order !== undefined) {
      return book1.order - book2.order
    }
    return book1.title.localeCompare(book2.title)
  })
}
