import type { Book } from '~/types/book'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from '~/types/database'
import type { Collection } from '~/types/collection'
import { toISOString, fromSimpleDate, now } from './date'
import type { GoogleBook } from '~/types/google'
import type { Author } from '~/types/author'
import type { Goal } from '~/types/goal'
import { v4 as uuidv4 } from 'uuid'

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
    format: dbBook.format,
    startedAt: dbBook.started_at ? dbBook.started_at : null,
    finishedAt: dbBook.finished_at ? dbBook.finished_at : null,
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
    progress_status: book.progressStatus || 'not-owned',
    format: book.format || null,
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

function getGoalTypeAndEntries(dbGoal: GoalDB): Pick<Goal, 'type' | 'entries'> {
  if (dbGoal.type === 'books') {
    return {
      type: 'books',
      entries: dbGoal.entries
        .filter((entry) => entry.book_id != null)
        .map((entry) => ({
          id: entry.id,
          book: entry.book_id!,
          createdAt: entry.created_at,
        })),
    }
  } else if (dbGoal.type === 'pages') {
    return {
      type: 'pages',
      entries: dbGoal.entries
        .filter((entry) => entry.pages != null)
        .map((entry) => ({
          id: entry.id,
          pages: entry.pages!,
          createdAt: entry.created_at,
        })),
    }
  } else if (dbGoal.type === 'hours') {
    return {
      type: 'hours',
      entries: dbGoal.entries
        .filter((entry) => entry.hours != null)
        .map((entry) => ({
          id: entry.id,
          hours: entry.hours!,
          createdAt: entry.created_at,
        })),
    }
  }
  throw new Error(`Unknown goal type: ${dbGoal.type}`)
}

export function dbGoalToGoal(dbGoal: GoalDB): Goal {
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    interval: dbGoal.interval,
    amount: +dbGoal.amount,
    createdAt: dbGoal.created_at,
    startAt: dbGoal.start_at,
    finishAt: dbGoal.finish_at,
    status: dbGoal.status,
    author: dbGoal.author_id,
    genres: dbGoal.genres,
    completedAt: dbGoal.completed_at,
    ...getGoalTypeAndEntries(dbGoal),
  } as Goal
}

function getGoalTypeAndEntriesDb(goal: Goal): Pick<GoalDB, 'type' | 'entries'> {
  if (goal.type === 'books') {
    return {
      type: 'books',
      entries: (goal.entries || []).map((entry) => ({
        id: entry.id ?? uuidv4(),
        book_id: entry.book,
        created_at: entry.createdAt ? fromSimpleDate(entry.createdAt) : now(),
      })),
    }
  } else if (goal.type === 'pages') {
    return {
      type: 'pages',
      entries: (goal.entries || []).map((entry) => ({
        id: entry.id ?? uuidv4(),
        pages: entry.pages,
        created_at: entry.createdAt ? fromSimpleDate(entry.createdAt) : now(),
      })),
    }
  } else if (goal.type === 'hours') {
    return {
      type: 'hours',
      entries: (goal.entries || []).map((entry) => ({
        id: entry.id ?? uuidv4(),
        hours: entry.hours,
        created_at: entry.createdAt ? fromSimpleDate(entry.createdAt) : now(),
      })),
    }
  }
  // @ts-expect-error unknown goal type
  throw new Error(`Unknown goal type: ${goal.type}`)
}

export function goalToDbGoal(goal: Goal): GoalDB {
  return {
    id: goal.id ?? uuidv4(),
    created_at: toISOString(goal.createdAt || now()),
    title: goal.title,
    interval: goal.interval,
    amount: +goal.amount,
    start_at: goal.startAt,
    finish_at: goal.finishAt,
    status: goal.status,
    author_id: goal.author,
    genres: goal.genres || [],
    completed_at: goal.completedAt || null,
    ...getGoalTypeAndEntriesDb(goal),
  }
}

export function googleBookToBook(googleBook: GoogleBook): Book {
  return {
    id: '0',
    title: googleBook.volumeInfo.title,
    coverSrc: googleBook.volumeInfo.imageLinks?.thumbnail || null,
    createdAt: '',
    isbn: null,
    language: googleBook.volumeInfo.language,
    originalTitle: null,
    originalLanguage: null,
    pages: googleBook.volumeInfo.pageCount,
    publisher: googleBook.volumeInfo.publisher,
    rating: 0,
    summary: googleBook.volumeInfo.description,
    year: (() => {
      if (!googleBook.volumeInfo.publishedDate) return null
      const date = new Date(googleBook.volumeInfo.publishedDate)
      return isNaN(date.getTime()) ? null : date.getFullYear()
    })(),
    genres: googleBook.volumeInfo.categories || [],
    collections: [],
    progressStatus: null,
    format: null,
    startedAt: null,
    finishedAt: null,
    author: null,
  }
}
