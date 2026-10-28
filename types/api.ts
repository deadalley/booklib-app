import type { BookProgressStatus } from './book'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from './database'

export type LibraryIntegrityResult = {
  books: string[]
  collections: string[]
  authors: string[]
}

export type DeleteAuthorParams = {
  deleteBooks?: boolean
}

export type UpdateAuthorParams = {
  name?: string
  // When set, these books get this author and its other books are unassigned
  bookIds?: BookDB['id'][]
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
