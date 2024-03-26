import type { Book } from '~/types/book'
import type { BookDB } from '~/types/database'

export function dbBooktoBook(dbBook: BookDB): Book {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    author_id,
    original_language,
    original_title,
    created_at,
    cover_src,
    ...rest
  } = dbBook
  return {
    ...rest,
    originalLanguage: original_language,
    originalTitle: original_title,
    createdAt: created_at,
    coverSrc: cover_src,
  }
}

export function bookToDbBook(
  book: Book,
  userId: string,
): Omit<BookDB, 'created_at' | 'id'> {
  return {
    author_id: 1,
    user_id: userId,
    ...(book.id ? { id: book.id } : {}),
    // created_at: createdAt,
    original_title: book.originalTitle,
    cover_src: book.coverSrc,
    original_language: book.originalLanguage,
    isbn: book.isbn,
    language: book.language,
    pages: book.pages,
    publisher: book.publisher,
    rating: book.rating,
    summary: book.summary,
    title: book.title,
    year: book.year,
  }
}
