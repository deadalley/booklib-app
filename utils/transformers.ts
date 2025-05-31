import type { Book } from '~/types/book'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from '~/types/database'
import type { Collection } from '~/types/collection'
import { toSimpleDate } from './date'
import type { GoogleBook } from '~/types/google'
import type { Author } from '~/types/author'
import type { Goal } from '~/types/goal'

export function nullify<T>(value: T) {
  return value === undefined || value === null || value === '' ? null : value
}

export function dbAuthorToAuthor(dbAuthor: AuthorDB): Author {
  return {
    id: dbAuthor.id,
    name: dbAuthor.name,
    createdAt: dbAuthor.created_at,
  }
}

export function dbBookToBook(
  dbBook: BookDB,
  collections: CollectionDB['id'][],
): Book {
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
    rating: dbBook.rating,
    summary: dbBook.summary,
    year: dbBook.year,
    genres: dbBook.genres ?? [],
    progressStatus: dbBook.progress_status,
    bookFormat: dbBook.book_format,
    startedAt: dbBook.started_at ? toSimpleDate(dbBook.started_at) : null,
    finishedAt: dbBook.finished_at ? toSimpleDate(dbBook.finished_at) : null,
    collections,
    author: dbBook.author_id,
  }
}

export function bookToDbBook(
  book: Partial<Book>,
): Omit<BookDB, 'created_at' | 'id'> {
  return {
    author_id: book.author || null,
    ...(book.id ? { id: book.id } : {}),
    original_title: book.originalTitle || null,
    cover_src: book.coverSrc || null,
    original_language: book.originalLanguage || null,
    isbn: book.isbn || null,
    language: book.language || null,
    pages: nullify(book.pages),
    publisher: book.publisher || null,
    rating: nullify(book.rating),
    summary: book.summary || null,
    title: book.title || '',
    year: nullify(book.year),
    genres: book.genres || null,
    progress_status: book.progressStatus || 'not-read',
    book_format: book.bookFormat || null,
    started_at: nullify(book.startedAt),
    finished_at: nullify(book.finishedAt),
    collections: book.collections ?? [],
  }
}

export function dbCollectionToCollection(
  dbCollection: CollectionDB,
  books: { book_id: Book['id']; order: number }[],
): Collection {
  return {
    id: dbCollection.id,
    name: dbCollection.name,
    createdAt: dbCollection.created_at,
    books: books
      .map(({ book_id, order }) => ({ id: book_id, order }))
      .sort(({ order: order1 }, { order: order2 }) => order1 - order2),
  }
}

export function collectionToDbCollection(
  collection: Collection,
): Omit<CollectionDB, 'created_at' | 'id'> {
  return {
    ...(collection.id ? { id: collection.id } : {}),
    name: collection.name,
  }
}

export function dbGoalToGoal(dbGoal: GoalDB): Goal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    type: dbGoal.type,
    interval: dbGoal.interval,
    amount: dbGoal.amount,
    createdAt: dbGoal.created_at,
    startedAt: toSimpleDate(dbGoal.started_at),
    finishedAt: toSimpleDate(dbGoal.finished_at),
    status: dbGoal.status,
    author: dbGoal.author_id,
    genres: dbGoal.genres,
  }
}

export function goalToDbGoal(goal: Goal): Omit<GoalDB, 'created_at' | 'id'> {
  return {
    ...(goal.id ? { id: goal.id } : {}),
    title: goal.title,
    type: goal.type,
    interval: goal.interval,
    amount: goal.amount,
    started_at: goal.startedAt,
    finished_at: goal.finishedAt,
    status: goal.status,
    author_id: goal.author,
    genres: goal.genres || [],
  }
}

export function googleBookToBook(googleBook: GoogleBook): Book {
  return {
    id: '0',
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
    genres: googleBook.volumeInfo.categories || [],
    collections: [],
    progressStatus: null,
    bookFormat: null,
    startedAt: null,
    finishedAt: null,
    author: null,
  }
}
