import type { Book, BookProgressStatus } from './book'
import type { Collection } from './collection'
import type { BookDB, CollectionDB } from './database'
import type { H3Event, EventHandlerRequest } from 'h3'

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

export type DBClient<ID extends number | string = number> = {
  getBook: (
    event: H3Event<EventHandlerRequest>,
    id: BookDB<ID>['id'],
  ) => Promise<BookDB<ID> | null>
  getBooks: (
    event: H3Event<EventHandlerRequest>,
    params: GetBooksQuerySearchParams,
  ) => Promise<BookDB<ID>[]>
  createBook: (
    event: H3Event<EventHandlerRequest>,
    book: Book<ID>,
    collections: Pick<CollectionDB<ID>, 'id'>[],
    tempCoverSrc?: string,
  ) => Promise<
    (BookDB<ID> & { collections: Pick<CollectionDB<ID>, 'id'>[] }) | null
  >
  deleteBook: (
    event: H3Event<EventHandlerRequest>,
    id: BookDB<ID>['id'],
  ) => Promise<BookDB<ID>['id'] | null>
  deleteBooks: (
    event: H3Event<EventHandlerRequest>,
    ids: BookDB<ID>['id'][],
  ) => Promise<BookDB<ID>['id'][]>
  getBookCount: (event: H3Event<EventHandlerRequest>) => Promise<number | null>
  getLatestBooks: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<Pick<BookDB<ID>, 'id' | 'title' | 'cover_src'>[]>
  getOrderedBooks: (
    event: H3Event<EventHandlerRequest>,
    params: GetOrderedBooksQuerySearchParams,
  ) => Promise<Pick<BookDB<ID>, 'id' | 'title'>[]>
  getBookCover: (
    event: H3Event<EventHandlerRequest>,
    id: string,
  ) => Promise<string | null>
  updateBookCover: (
    event: H3Event<EventHandlerRequest>,
    bookId: string,
    formData: FormData,
  ) => Promise<string | null>

  getCollection: (
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB<ID>['id'],
  ) => Promise<
    | (CollectionDB<ID> & {
        'collection-book': { book_id: BookDB<ID>['id']; order: number }[]
      })
    | null
  >
  getCollections: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<CollectionDB<ID>[]>
  createCollection: (
    event: H3Event<EventHandlerRequest>,
    collection: Collection<ID>,
  ) => Promise<
    | (CollectionDB<ID> & {
        'collection-book': { book_id: Book<ID>['id']; order: number }[]
      })
    | null
  >
  deleteCollection: (
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB<ID>['id'],
  ) => Promise<CollectionDB<ID>['id'] | null>

  deleteUser: (event: H3Event<EventHandlerRequest>) => Promise<string | null>
  isLibraryEmpty: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
  resetLibrary: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
  importLibrary: (
    event: H3Event<EventHandlerRequest>,
    books: Book<ID>[],
  ) => Promise<boolean>
}
