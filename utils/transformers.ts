import type { Book } from '~/types/book'
import type { BookDB, CollectionDB } from '~/types/database'
import type { Collection } from '~/types/collection'
import { toSimpleDate } from './date'

export function nullify<T>(value: T) {
  return value === undefined || value === null || value === '' ? null : value
}

export function dbBookToBook(
  dbBook: BookDB,
  collections: Pick<CollectionDB, 'id'>[],
): Book {
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
    collections: collections.map(({ id }) => id),
    progressStatus: dbBook.progress_status ?? undefined,
    startedAt: dbBook.started_at ? toSimpleDate(dbBook.started_at) : undefined,
    finishedAt: dbBook.finished_at
      ? toSimpleDate(dbBook.finished_at)
      : undefined,
  }
}

export function bookToDbBook(
  book: Partial<Book>,
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
    pages: nullify(book.pages),
    publisher: book.publisher ?? null,
    rating: nullify(book.rating),
    summary: book.summary ?? null,
    title: book.title ?? '',
    year: nullify(book.year),
    genres: book.genres ?? null,
    progress_status:
      book.progressStatus === undefined ? null : book.progressStatus,
    started_at: nullify(book.startedAt),
    finished_at: nullify(book.finishedAt),
  }
}

export function dbCollectionToCollection(
  dbCollection: CollectionDB,
  books: { book_id: Book['id']; order: number }[],
): Collection {
  return {
    id: dbCollection.id ?? undefined,
    name: dbCollection.name,
    createdAt: dbCollection.created_at,
    books: books
      .map(({ book_id, order }) => ({ id: book_id, order }))
      .sort(({ order: order1 }, { order: order2 }) => order1 - order2),
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
  }
}
