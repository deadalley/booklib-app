import type { Book } from '~/types/book'
import type { BookDB } from '~/types/database'

export function dbBooktoBook(dbBook: BookDB): Book {
  const {
    author_id,
    original_language,
    original_title,
    created_at,
    cover_src,
    ...rest
  } = dbBook
  return {
    ...rest,
    authorId: author_id,
    originalLanguage: original_language,
    originalTitle: original_title,
    createdAt: created_at,
    coverSrc: cover_src,
  }
}

export function bookToDbBook(
  book: Book,
  userId: string,
): Omit<BookDB, 'created_at'> {
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
    author_id: authorId ?? 1,
    user_id: userId,
    original_title: originalTitle,
    // created_at: createdAt,
    cover_src: coverSrc,
    original_language: originalLanguage,
  }
}
