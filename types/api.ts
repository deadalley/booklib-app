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

export type DBClient = {
  getBook: (
    event: H3Event<EventHandlerRequest>,
    id: number,
  ) => Promise<BookDB | null>
  getBooks: (
    event: H3Event<EventHandlerRequest>,
    params: GetBooksQuerySearchParams,
  ) => Promise<BookDB[]>
  createBook: (
    event: H3Event<EventHandlerRequest>,
    book: Book,
    collections: CollectionDB[],
    tempCoverSrc?: string,
  ) => Promise<(BookDB & { collections: Pick<CollectionDB, 'id'>[] }) | null>
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
  ) => Promise<string | null>
  updateBookCover: (
    event: H3Event<EventHandlerRequest>,
    bookId: string,
    formData: FormData,
  ) => Promise<string | null>

  getCollection: (
    event: H3Event<EventHandlerRequest>,
    id: number,
  ) => Promise<CollectionDB | null>
  getCollections: (
    event: H3Event<EventHandlerRequest>,
  ) => Promise<CollectionDB[]>
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
  ) => Promise<CollectionDB['id'] | null>

  deleteUser: (event: H3Event<EventHandlerRequest>) => Promise<string | null>
  isLibraryEmpty: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
  resetLibrary: (event: H3Event<EventHandlerRequest>) => Promise<boolean>
}
