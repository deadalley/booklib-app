import type { Book } from '~/types/book'
import type { BookDB, CollectionDB } from '~/types/database'
import languageOptions from '~/public/languages-2.json'
import type { Collection } from '~/types/collection'

export function dbBookToBook(dbBook: BookDB): Book {
  return {
    id: dbBook.id ?? undefined,
    title: dbBook.title ?? undefined,
    coverSrc: dbBook.cover_src ?? undefined,
    createdAt: dbBook.created_at ?? undefined,
    isbn: dbBook.isbn ?? undefined,
    language: dbBook.language ?? undefined,
    originalTitle: dbBook.original_title ?? undefined,
    originalLanguage: dbBook.original_language ?? undefined,
    pages: dbBook.pages ?? undefined,
    publisher: dbBook.publisher ?? undefined,
    rating: dbBook.rating ?? 0,
    summary: dbBook.summary ?? undefined,
    year: dbBook.year ?? undefined,
    genres: dbBook.genres ?? [],
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
    original_title: book.originalTitle ?? null,
    cover_src: book.coverSrc ?? null,
    original_language: book.originalLanguage ?? null,
    isbn: book.isbn ?? null,
    language: book.language ?? null,
    pages: book.pages ?? null,
    publisher: book.publisher ?? null,
    rating: book.rating ?? null,
    summary: book.summary ?? null,
    title: book.title,
    year: book.year ?? null,
    genres: book.genres ?? null,
  }
}

export function dbCollectionToCollection(
  dbCollection: CollectionDB,
  books: Pick<BookDB, 'id'>[],
): Collection {
  return {
    id: dbCollection.id ?? undefined,
    name: dbCollection.name,
    description: dbCollection.description ?? undefined,
    createdAt: dbCollection.created_at,
    books: books.map(({ id }) => ({ id })),
  }
}

export function collectionToDbCollection(
  collection: Collection,
  userId: string,
): Omit<CollectionDB, 'created_at' | 'id'> {
  return {
    ...(collection.id ? { id: collection.id } : {}),
    user_id: userId,
    name: collection.name,
    description: collection.description ?? null,
  }
}

export function getDisplayLanguage(langCode: string) {
  return languageOptions[langCode as keyof typeof languageOptions] ?? langCode
}
