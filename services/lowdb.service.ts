import type { H3Event, EventHandlerRequest } from 'h3'
import type {
  DBClient,
  DeleteAuthorParams,
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
} from '~/types/api'
import { JSONFilePreset } from 'lowdb/node'
import type { AuthorDB, BookDB, CollectionDB } from '~/types/database'
import type { Book } from '~/types/book'
import { v4 as uuidv4 } from 'uuid'
import type { Collection } from '~/types/collection'
import {
  bookToDbBook,
  collectionToDbCollection,
  logger,
  FAVORITE_COLLECTION_ID,
  WISHLIST_COLLECTION_ID,
  DEFAULT_COLLECTIONS,
} from '../utils'
import type { ServerFile } from 'nuxt-file-storage'
import { createReadStream } from 'fs'
import difference from 'lodash/difference'

const user = {
  id: 'userId',
}

const DEFAULT_COLLECTIONS_INIT = [
  {
    id: WISHLIST_COLLECTION_ID,
    name: 'Wishlist',
  },
  {
    id: FAVORITE_COLLECTION_ID,
    name: 'Favorites',
  },
]

type Database = {
  authors: AuthorDB<string>[]
  books: BookDB<string>[]
  collections: CollectionDB<string>[]
  'collection-book': {
    book_id: BookDB<string>['id']
    collection_id: CollectionDB<string>['id']
    order: number
    user_id: string
  }[]
}

const client = await JSONFilePreset<Database>('usr/booklib.json', {
  authors: [],
  books: [],
  // collections: [],
  collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
    ...c,
    created_at: new Date().toISOString(),
    user_id: user.id,
  })),
  'collection-book': [],
})

function isBookCover(id: string) {
  return (fileName: string) => fileName.split('.')[0] === id
}

async function getAllBookCoverFileNames() {
  return getFilesLocally('/bookCovers')
}

async function getBookCoverFileName(id: string) {
  const allFiles = await getAllBookCoverFileNames()

  // find the file extension
  const fileName = allFiles.find(isBookCover(id))

  return fileName
}

function getBookCoverUrl(bookId: string | number) {
  return `${process.env.VITE_DEV_SERVER_URL}/api/books/${bookId}/cover`
}

export async function getAuthors(): ReturnType<DBClient<string>['getAuthors']> {
  await client.read()

  const data = client.data.authors

  return data
}

export async function deleteAuthor(
  event: H3Event<EventHandlerRequest>,
  id: AuthorDB<string>['id'],
  params: DeleteAuthorParams,
): ReturnType<DBClient<string>['deleteAuthor']> {
  await client.read()

  client.data.authors = client.data.authors.filter((author) => author.id !== id)

  if (params.deleteBooks) {
    client.data.books = client.data.books.filter(
      (book) => book.author_id !== id,
    )
  } else {
    client.data.books = client.data.books.map((book) =>
      book.author_id === id ? { ...book, author_id: null } : book,
    )
  }

  await client.write()

  return id
}

export async function getBook(
  event: H3Event<EventHandlerRequest>,
  id: string,
): ReturnType<DBClient<string>['getBook']> {
  await client.read()

  const book = client.data.books.find((book) => book.id === id)

  const bookCovers = await getAllBookCoverFileNames()
  const hasBookCover = book?.id && bookCovers.find(isBookCover(book.id))

  const collections = client.data['collection-book']
    .filter(({ book_id }) => book_id === id)
    .map(({ collection_id: id }) => ({ id }))

  return book
    ? {
        ...book,
        collections,
        cover_src: hasBookCover ? getBookCoverUrl(book.id) : null,
      }
    : null
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

  const bookCovers = await getAllBookCoverFileNames()

  data = data.map((book) => {
    const hasBookCover = bookCovers.find(isBookCover(book.id))

    const collections = client.data['collection-book']
      .filter(({ book_id }) => book_id === book.id)
      .map(({ collection_id: id }) => ({ id }))

    return {
      ...book,
      collections,
      cover_src: hasBookCover ? getBookCoverUrl(book.id) : null,
    }
  })

  return data
}

export async function createBook(
  event: H3Event<EventHandlerRequest>,
  book: Book<string>,
  collections: Pick<CollectionDB<string>, 'id'>[],
): ReturnType<DBClient<string>['createBook']> {
  await client.read()

  const existingAuthor = client.data.authors.find(
    ({ id }) => id === book.author,
  )

  const authorId = existingAuthor?.id ?? uuidv4()

  if (!existingAuthor) {
    if (book.author) {
      client.data.authors.push({
        id: authorId,
        name: book.author,
        created_at: new Date().toISOString(),
      })
    }
  }

  const bookDb: BookDB<string> = {
    ...bookToDbBook(book, user.id),
    id: book.id ?? uuidv4(),
    author_id: book.author ? authorId : null,
    created_at: new Date().toISOString(),
  }

  const bookIndex = client.data.books.findIndex((b) => b.id === bookDb.id)

  if (bookIndex !== -1) {
    client.data.books.splice(bookIndex, 1, bookDb)
  } else {
    client.data.books.push(bookDb)
  }

  const incomingCollectionIds = collections.map(({ id }) => id)
  const existingCollectionIds = client.data['collection-book']
    .filter(({ book_id }) => book_id === bookDb.id)
    .map(({ collection_id }) => collection_id)

  const collectionsToAdd = difference(
    incomingCollectionIds,
    existingCollectionIds,
  )
  const collectionsToRemove = difference(
    existingCollectionIds,
    incomingCollectionIds,
  )

  client.data['collection-book'] = client.data['collection-book']
    .filter(
      ({ book_id, collection_id }) =>
        book_id !== bookDb.id || !collectionsToRemove.includes(collection_id),
    )
    .concat(
      collectionsToAdd.map((collection_id) => ({
        book_id: bookDb.id,
        collection_id,
        order: client.data['collection-book'].filter(
          (cb) => collection_id === cb.collection_id,
        ).length,
        user_id: user.id,
      })),
    )

  await client.write()

  return bookDb
}

export async function deleteBook(
  event: H3Event<EventHandlerRequest>,
  id: BookDB<string>['id'],
): ReturnType<DBClient<string>['deleteBook']> {
  await client.read()

  client.data.books = client.data.books.filter((book) => book.id !== id)
  client.data['collection-book'] = client.data['collection-book'].filter(
    ({ book_id }) => book_id !== id,
  )

  await client.write()

  return id
}

export async function deleteBooks(
  event: H3Event<EventHandlerRequest>,
  ids: BookDB<string>['id'][],
): ReturnType<DBClient<string>['deleteBooks']> {
  await client.read()

  client.data.books = client.data.books.filter((b) => !ids.includes(b.id))

  client.data['collection-book'] = client.data['collection-book'].filter(
    ({ book_id }) => ids.includes(book_id),
  )

  await client.write()

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

export async function getBookCover(
  event: H3Event<EventHandlerRequest>,
  id: string,
): ReturnType<DBClient<string>['getBookCover']> {
  const fileName = await getBookCoverFileName(id)

  const filePath = fileName && (await getFileLocally(fileName, '/bookCovers'))

  if (filePath) {
    return sendStream(event, createReadStream(filePath))
  }
}

export async function updateBookCover(
  event: H3Event<EventHandlerRequest>,
): ReturnType<DBClient<string>['updateBookCover']> {
  const { bookId, file } = await readBody<{ bookId: string; file: ServerFile }>(
    event,
  )

  const fileName = await getBookCoverFileName(bookId)

  if (fileName) {
    await deleteFile(fileName, '/bookCovers')
  }

  await storeFileLocally(file, bookId, '/bookCovers')

  const bookCoverUrl = getBookCoverUrl(bookId)

  await client.read()

  client.data.books = client.data.books.map((book) => {
    if (book.id === bookId) {
      return {
        ...book,
        cover_src: bookCoverUrl,
      }
    }

    return book
  })

  await client.write()

  return bookCoverUrl
}

export async function deleteBookCover(
  event: H3Event<EventHandlerRequest>,
): ReturnType<DBClient<string>['deleteBookCover']> {
  const bookId = getRouterParam(event, 'id')

  const allFiles = await getFilesLocally('/bookCovers')

  // find the file extension
  const fileName = allFiles.find(
    (fileName) => fileName.split('.')[0] === bookId,
  )

  if (fileName) {
    await deleteFile(fileName, '/bookCovers')

    client.data.books = client.data.books.map((book) => {
      if (book.id === bookId) {
        return {
          ...book,
          cover_src: null,
        }
      }

      return book
    })

    await client.write()

    return null
  }

  const error = { message: `Book cover not found for ${bookId} to delete` }
  logger.error(error)
  throw createError(error.message)
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

export async function getCollectionCount(): ReturnType<
  DBClient<string>['getCollectionCount']
> {
  await client.read()

  return client.data.collections.length
}

export async function createCollection(
  event: H3Event<EventHandlerRequest>,
  collection: Collection<string>,
): ReturnType<DBClient<string>['createCollection']> {
  await client.read()

  const collectionDb: CollectionDB<string> = {
    ...collectionToDbCollection(collection, user.id),
    id: collection.id ?? uuidv4(),
    created_at: new Date().toISOString(),
  }

  const bookIndex = client.data.collections.findIndex(
    (b) => b.id === collectionDb.id,
  )

  if (bookIndex !== -1) {
    client.data.collections.splice(bookIndex, 1, collectionDb)
  } else {
    client.data.collections.push(collectionDb)
  }

  client.data['collection-book'] = client.data['collection-book'].filter(
    (cb) => cb.collection_id !== collectionDb.id,
  )

  const collectionBooks = collection.books.map((book) => ({
    book_id: book.id,
    collection_id: collectionDb.id,
    order: book.order,
    user_id: user.id,
  }))

  client.data['collection-book'] =
    client.data['collection-book'].concat(collectionBooks)

  await client.write()

  return { ...collectionDb, 'collection-book': collectionBooks }
}

export async function deleteCollection(
  event: H3Event<EventHandlerRequest>,
  id: CollectionDB<string>['id'],
): ReturnType<DBClient<string>['deleteCollection']> {
  if (DEFAULT_COLLECTIONS.includes(id)) {
    const error = { message: `Cannot delete ${id}` }
    logger.error(error)
    throw createError(error.message)
  }
  await client.read()

  client.data.collections = client.data.collections.filter((c) => c.id !== id)
  client.data['collection-book'] = client.data['collection-book'].filter(
    ({ collection_id }) => collection_id !== id,
  )

  await client.write()

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

export async function importLibrary(
  event: H3Event<EventHandlerRequest>,
  books: Book<string>[],
): ReturnType<DBClient<string>['importLibrary']> {
  await client.read()

  client.data.books = client.data.books.concat(
    books.map(({ id, ...book }) => ({
      ...bookToDbBook(book, user.id),
      id: uuidv4(),
      created_at: new Date().toISOString(),
    })),
  )

  await client.write()

  return true
}
