import type { H3Event, EventHandlerRequest } from 'h3'
import type { DBClient, GetBooksQuerySearchParams } from '~/types/api'
import { JSONFilePreset } from 'lowdb/node'
import type { BookDB, CollectionDB } from '~/types/database'
import type { Book } from '~/types/book'
import { v4 as uuidv4 } from 'uuid'

const user = {
  id: 'userId',
}

type Database = {
  books: BookDB<string>[]
  collections: CollectionDB[]
  'collection-book': {
    book_id: BookDB<string>['id']
    collection_id: CollectionDB['id']
    order: number
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
  collections: Pick<CollectionDB, 'id'>[],
): ReturnType<DBClient<string>['createBook']> {
  const bookDb: BookDB<string> = {
    ...bookToDbBook(book, user.id),
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }

  await client.update((data) => {
    const bookIndex = data.books.findIndex((b) => b.id === book.id)

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
      })),
    )
  })

  return bookDb
}
