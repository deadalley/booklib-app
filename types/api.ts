import type { Book, BookProgressStatus } from './book'
import type { Collection } from './collection'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from './database'
import type { ServerFile } from 'nuxt-file-storage'

export type LibraryIntegrityResult = {
  books: string[]
  collections: string[]
  authors: string[]
}

export type DeleteAuthorParams = {
  deleteBooks?: boolean
}

export type DeleteCollectionParams = {
  deleteBooks?: boolean
}

export type GetBooksQuerySearchParams = {
  page?: number
  pageSize?: number
  bookProgress?: BookProgressStatus
  withBookCovers?: boolean
}

type Property = keyof Pick<BookDB, 'pages' | 'year'>
export type GetOrderedBooksQuerySearchParams = {
  property: Property
  count?: number
}

export interface DBClient {
  getAuthors: () => Promise<AuthorDB[]>
  deleteAuthor: (
    id: AuthorDB['id'],
    params: DeleteAuthorParams,
  ) => Promise<AuthorDB['id']>

  getBook: (id: BookDB['id']) => Promise<BookDB | null>
  getBooks: (params: GetBooksQuerySearchParams) => Promise<BookDB[]>
  createBook: (
    book: BookDB,
    collections: CollectionDB['id'][],
  ) => Promise<BookDB | null>
  deleteBook: (id: BookDB['id']) => Promise<BookDB['id'] | null>
  deleteBooks: (ids: BookDB['id'][]) => Promise<BookDB['id'][]>
  getBookCount: () => Promise<number | null>
  getLatestBooks: () => Promise<BookDB[]>
  getOrderedBooks: (
    params: GetOrderedBooksQuerySearchParams,
  ) => Promise<BookDB[]>
  getBookCover: (id: BookDB['id']) => Promise<string | null>
  updateBookCover: (
    id: BookDB['id'],
    file: ServerFile,
  ) => Promise<string | null>
  deleteBookCover: (id: BookDB['id']) => Promise<null>

  getCollection: (id: CollectionDB['id']) => Promise<
    | (CollectionDB & {
        'collection-book': { book_id: BookDB['id']; order: number }[]
      })
    | null
  >
  getCollections: () => Promise<
    (CollectionDB & {
      'collection-book': { book_id: BookDB['id']; order: number }[]
    })[]
  >
  getCollectionCount: () => Promise<number | null>
  createCollection: (
    collection: CollectionDB,
    books: Collection['books'],
  ) => Promise<
    | (CollectionDB & {
        'collection-book': { book_id: Book['id']; order: number }[]
      })
    | null
  >
  deleteCollection: (
    id: CollectionDB['id'],
    params: DeleteCollectionParams,
  ) => Promise<CollectionDB['id'] | null>

  getGoal: (id: GoalDB['id']) => Promise<GoalDB | null>
  getGoals: () => Promise<GoalDB[] | null>
  createGoal: (goal: GoalDB) => Promise<GoalDB | null>
  deleteGoal: (id: GoalDB['id']) => Promise<GoalDB['id'] | null>

  isLibraryEmpty: () => Promise<boolean>
  resetLibrary: () => Promise<boolean>
  importLibrary: (books: BookDB[]) => Promise<boolean>
  checkLibraryIntegrity: () => Promise<object>
}

export type Database = {
  authors: AuthorDB[]
  books: BookDB[]
  collections: CollectionDB[]
  'collection-book': {
    book_id: BookDB['id']
    collection_id: CollectionDB['id']
    order: number
  }[]
  goals: GoalDB[]
}
