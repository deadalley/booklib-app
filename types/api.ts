import type { Book, BookProgressStatus } from './book'
import type { Collection } from './collection'
import type { AuthorDB, BookDB, CollectionDB } from './database'
import type { H3Event, EventHandlerRequest } from 'h3'

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

export type DBClient = {
  getAuthors: (event: H3Event<EventHandlerRequest>) => Promise<AuthorDB[]>
  deleteAuthor: (
    event: H3Event<EventHandlerRequest>,
    id: AuthorDB['id'],
    params: DeleteAuthorParams,
  ) => Promise<AuthorDB['id']>

  getBook: (
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ) => Promise<BookDB | null>
  getBooks: (
    event: H3Event<EventHandlerRequest>,
    params: GetBooksQuerySearchParams,
  ) => Promise<BookDB[]>
  createBook: (
    event: H3Event<EventHandlerRequest>,
    book: Book,
    collections: CollectionDB['id'][],
    tempCoverSrc?: string,
  ) => Promise<BookDB | null>
  deleteBook: (
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ) => Promise<BookDB['id'] | null>
  deleteBooks: (
    event: H3Event<EventHandlerRequest>,
    ids: BookDB['id'][],
  ) => Promise<BookDB['id'][]>
  getBookCount: (event: H3Event<EventHandlerRequest>) => Promise<number | null>
  getLatestBooks: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<Pick<BookDB, 'id' | 'title' | 'cover_src'>[]>
  getOrderedBooks: (
    event: H3Event<EventHandlerRequest>,
    params: GetOrderedBooksQuerySearchParams,
  ) => Promise<Pick<BookDB, 'id' | 'title'>[]>
  getBookCover: (
    event: H3Event<EventHandlerRequest>,
    id: string,
  ) => Promise<void>
  updateBookCover: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<string | null>
  deleteBookCover: (event: H3Event<EventHandlerRequest>) => Promise<null>

  getCollection: (
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB['id'],
  ) => Promise<
    | (CollectionDB & {
        'collection-book': { book_id: BookDB['id']; order: number }[]
      })
    | null
  >
  getCollections: (event: H3Event<EventHandlerRequest>) => Promise<
    (CollectionDB & {
      'collection-book': { book_id: BookDB['id']; order: number }[]
    })[]
  >
  getCollectionCount: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<number | null>
  createCollection: (
    event: H3Event<EventHandlerRequest>,
    collection: Collection,
  ) => Promise<
    | (CollectionDB & {
        'collection-book': { book_id: Book['id']; order: number }[]
      })
    | null
  >
  deleteCollection: (
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB['id'],
    params: DeleteCollectionParams,
  ) => Promise<CollectionDB['id'] | null>

  isLibraryEmpty: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
  resetLibrary: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
  importLibrary: (
    event: H3Event<EventHandlerRequest>,
    books: Book[],
  ) => Promise<boolean>
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
}
