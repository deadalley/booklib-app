import type { H3Event, EventHandlerRequest } from 'h3'
import type {
  DBClient,
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
} from '~/types/api'
import { JSONFilePreset } from 'lowdb/node'
import type { BookDB, CollectionDB } from '~/types/database'
import type { Book } from '~/types/book'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/types/collection'

const user = {
  id: 'userId',
}

type Database = {
  books: BookDB<string>[]
  collections: CollectionDB<string>[]
  'collection-book': {
    book_id: BookDB<string>['id']
    collection_id: CollectionDB<string>['id']
    order: number
    user_id: string
  }[]
}

const client = await JSONFilePreset<Database>('booklib.json', {
  books: [],
  collections: [],
  'collection-book': [],
})

export async function getBook(
  event: H3Event<EventHandlerRequest>,
  id: string,
): ReturnType<DBClient<string>['getBook']> {
  await client.read()
  return client.data.books.find((book) => book.id === id) ?? null
}

export async function getBooks(
  event: H3Event<EventHandlerRequest>,
  { page, pageSize, bookProgress }: GetBooksQuerySearchParams,
): ReturnType<DBClient<string>['getBooks']> {
  await client.read()

  let data = client.data.books

  if (page !== undefined && pageSize !== undefined) {
    data = data.slice(page * pageSize, (page + 1) * pageSize - 1)
  }

  if (bookProgress !== undefined) {
    data = data.filter((book) => book.progress_status === bookProgress)
  }

  return data
}

export async function createBook(
  event: H3Event<EventHandlerRequest>,
  book: Book<string>,
  collections: Pick<CollectionDB<string>, 'id'>[],
): ReturnType<DBClient<string>['createBook']> {
  const bookDb: BookDB<string> = {
    ...bookToDbBook(book, user.id),
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  await client.update((data) => {
    const bookIndex = data.books.findIndex((b) => b.id === bookDb.id)

    if (bookIndex !== -1) {
      data.books.splice(bookIndex, 1, bookDb)
    } else {
      data.books.push(bookDb)
    }

    data['collection-book'] = data['collection-book'].filter(
      (cb) => cb.book_id !== bookDb.id,
    )
    data['collection-book'].concat(
      collections.map((collection) => ({
        book_id: bookDb.id,
        collection_id: collection.id,
        order: -1, // TODO: fix
        user_id: user.id,
      })),
    )
  })

  return bookDb
}

export async function deleteBook(
  event: H3Event<EventHandlerRequest>,
  id: BookDB<string>['id'],
): ReturnType<DBClient<string>['deleteBook']> {
  await client.update((data) => {
    data.books = data.books.filter((b) => b.id !== id)
  })

  return id
}

export async function deleteBooks(
  event: H3Event<EventHandlerRequest>,
  ids: BookDB<string>['id'][],
): ReturnType<DBClient<string>['deleteBooks']> {
  await client.update((data) => {
    data.books = data.books.filter((b) => !ids.includes(b.id))
  })

  return ids
}

export async function getBookCount(): ReturnType<DBClient['getBookCount']> {
  await client.read()

  return client.data.books.length
}

export async function getLatestBooks(): ReturnType<
  DBClient<string>['getLatestBooks']
> {
  await client.read()

  return client.data.books
    .sort(({ created_at: c1 }, { created_at: c2 }) =>
      new Date(c1) > new Date(c2) ? 1 : -1,
    )
    .slice(0, 9)
}

export async function getOrderedBooks(
  event: H3Event<EventHandlerRequest>,
  { property, count }: GetOrderedBooksQuerySearchParams,
): ReturnType<DBClient<string>['getOrderedBooks']> {
  await client.read()

  return client.data.books
    .filter((b) => b[property])
    .sort((b1, b2) =>
      b1[property]!.toLocaleString().localeCompare(
        b2[property]!.toLocaleString(),
      ),
    )
    .slice(0, count ?? 11)
}

export async function getBookCover(): ReturnType<
  DBClient<string>['getBookCover']
> {
  return ''
}

export async function updateBookCover(): ReturnType<
  DBClient<string>['updateBookCover']
> {
  return ''
}

export async function getCollection(
  event: H3Event<EventHandlerRequest>,
  id: string,
): ReturnType<DBClient<string>['getCollection']> {
  await client.read()

  const collection = client.data.collections.find((c) => c.id === id)
  const books = client.data['collection-book'].filter(
    (cb) => cb.collection_id === id,
  )

  return collection
    ? {
        ...collection,
        ['collection-book']: books,
      }
    : null
}

export async function getCollections(): ReturnType<
  DBClient<string>['getCollections']
> {
  await client.read()

  return client.data.collections.map((collection) => ({
    ...collection,
    ['collection-book']: client.data['collection-book'].filter(
      (cb) => cb.collection_id === collection.id,
    ),
  }))
}

export async function createCollection(
  event: H3Event<EventHandlerRequest>,
  collection: Collection<string>,
): ReturnType<DBClient<string>['createCollection']> {
  const collectionDb: CollectionDB<string> = {
    ...collectionToDbCollection(collection, user.id),
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  await client.update((data) => {
    const bookIndex = data.collections.findIndex(
      (b) => b.id === collectionDb.id,
    )

    if (bookIndex !== -1) {
      data.collections.splice(bookIndex, 1, collectionDb)
    } else {
      data.collections.push(collectionDb)
    }

    data['collection-book'] = data['collection-book'].filter(
      (cb) => cb.collection_id !== collectionDb.id,
    )
    data['collection-book'].concat(
      collection.books.map((book) => ({
        book_id: book.id,
        collection_id: collectionDb.id,
        order: -1, // TODO: fix
        user_id: user.id,
      })),
    )
  })

  return collectionDb
}

export async function deleteCollection(
  event: H3Event<EventHandlerRequest>,
  id: CollectionDB<string>['id'],
): ReturnType<DBClient<string>['deleteCollection']> {
  await client.update((data) => {
    data.collections = data.collections.filter((c) => c.id !== id)
  })

  return id
}

export async function deleteUser(): ReturnType<DBClient<string>['deleteUser']> {
  return null
}

export async function isLibraryEmpty(): ReturnType<
  DBClient<string>['isLibraryEmpty']
> {
  await client.read()

  return client.data.books.length === 0
}

export async function resetLibrary(): ReturnType<
  DBClient<string>['resetLibrary']
> {
  await client.update((data) => {
    data.books = []
    data.collections = []
    data['collection-book'] = []
  })

  return true
}
