import type { Book } from '~/types/book'
import type { BookDB, CollectionDB } from '~/types/database'
import type { Collection } from '~/types/collection'
import { toSimpleDate } from './date'
import type { GoogleBook } from '~/types/google'

export function nullify<T>(value: T) {
  return value === undefined || value === null || value === '' ? null : value
}

export function dbBookToBook<T extends number | string>(
  dbBook: BookDB<T>,
  collections: Pick<CollectionDB<T>, 'id'>[],
): Book<T> {
  return {
    id: dbBook.id,
    title: dbBook.title,
    coverSrc: dbBook.cover_src,
    createdAt: dbBook.created_at,
    isbn: dbBook.isbn,
    language: dbBook.language,
    originalTitle: dbBook.original_title,
    originalLanguage: dbBook.original_language,
    pages: dbBook.pages,
    publisher: dbBook.publisher,
    rating: dbBook.rating ?? 0,
    summary: dbBook.summary,
    year: dbBook.year,
    genres: dbBook.genres ?? [],
    collections: collections.map(({ id }) => id),
    progressStatus: dbBook.progress_status,
    startedAt: dbBook.started_at ? toSimpleDate(dbBook.started_at) : null,
    finishedAt: dbBook.finished_at ? toSimpleDate(dbBook.finished_at) : null,
  }
}

export function bookToDbBook<T extends number | string>(
  book: Partial<Book<T>>,
  userId: string,
): Omit<BookDB<T>, 'created_at' | 'id'> {
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
    progress_status: book.progressStatus ?? 'not-read',
    started_at: nullify(book.startedAt),
    finished_at: nullify(book.finishedAt),
    collections: [],
  }
}

export function dbCollectionToCollection<T extends number | string>(
  dbCollection: CollectionDB<T>,
  books: { book_id: Book<T>['id']; order: number }[],
): Collection<T> {
  return {
    id: dbCollection.id,
    name: dbCollection.name,
    createdAt: dbCollection.created_at,
    books: books
      .map(({ book_id, order }) => ({ id: book_id, order }))
      .sort(({ order: order1 }, { order: order2 }) => order1 - order2),
  }
}

export function collectionToDbCollection<T extends number | string>(
  collection: Collection<T>,
  userId: string,
): Omit<CollectionDB<T>, 'created_at' | 'id'> {
  return {
    ...(collection.id ? { id: collection.id } : {}),
    user_id: userId,
    name: collection.name,
    'collection-book': [],
  }
}

export function googleBookToBook(googleBook: GoogleBook): Book {
  return {
    id: 0,
    title: googleBook.volumeInfo.title,
    coverSrc: googleBook.volumeInfo.imageLinks.thumbnail,
    createdAt: '',
    isbn: null,
    language: googleBook.volumeInfo.language,
    originalTitle: null,
    originalLanguage: null,
    pages: googleBook.volumeInfo.pageCount,
    publisher: googleBook.volumeInfo.publisher,
    rating: 0,
    summary: googleBook.volumeInfo.description,
    year: new Date(googleBook.volumeInfo.publishedDate).getFullYear(),
    genres: googleBook.volumeInfo.categories ?? [],
    collections: [],
    progressStatus: null,
    startedAt: null,
    finishedAt: null,
  }
}
