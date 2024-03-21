import type { Book } from '~/types/book'
import type { BookDB } from '~/types/database'

export function dbBooktoBook(dbBook: BookDB): Book {
  return {
    ...dbBook,
    authorId: null,
    originalTitle: dbBook.original_title,
    createdAt: dbBook.created_at,
    coverSrc: dbBook.cover_src,
  }
}

export function bookToDbBook(book: Book, userId: string): BookDB {
  return {
    ...book,
    // author_id: null,
    user_id: userId,
    original_title: book.originalTitle,
    created_at: book.createdAt,
    cover_src: book.coverSrc,
  }
}
