import type { Book } from '~/types/book'
import type { BookDB } from '~/types/database'

export function dbBooktoBook(dbBook: BookDB): Book {
  return {
    ...dbBook,
    authorId: dbBook.author_id,
    originalLanguage: dbBook.original_language,
    originalTitle: dbBook.original_title,
    createdAt: dbBook.created_at,
    coverSrc: dbBook.cover_src,
  }
}

export function bookToDbBook(book: Book, userId: string): BookDB {
  const {
    authorId,
    originalTitle,
    createdAt,
    coverSrc,
    originalLanguage,
    ...rest
  } = book
  return {
    ...rest,
    author_id: authorId,
    user_id: userId,
    original_title: originalTitle,
    created_at: createdAt,
    cover_src: coverSrc,
    original_language: originalLanguage,
  }
}
