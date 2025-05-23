import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { GetBooksQuerySearchParams } from '~/types/api'
import type { Database } from '~/types/db.generate'
import type { BookDB, CollectionDB } from '~/types/database'
import type { H3Event, EventHandlerRequest } from 'h3'
import {
  bookToDbBook,
  collectionToDbCollection,
  executePromisesInChunks,
  logger,
} from '../utils'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

async function authenticate(event: H3Event<EventHandlerRequest>) {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError('Unauthenticated')
  }

  return { user, client }
}

export async function getBook(
  event: H3Event<EventHandlerRequest>,
  id: number,
): Promise<(BookDB & { collections: Pick<CollectionDB, 'id'>[] }) | null> {
  const { user, client } = await authenticate(event)

  const { data, error } = await client
    .from('books')
    .select('*, collections(id)')
    .eq('id', id)

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  const coverSrc = await getBookCoverUrl(client, user.id, data[0].id)

  return data ? { ...data[0], cover_src: coverSrc ?? '' } : null
}

export async function getBooks(
  event: H3Event<EventHandlerRequest>,
  { page, pageSize, bookProgress, withBookCovers }: GetBooksQuerySearchParams,
): Promise<(BookDB & { collections: Pick<CollectionDB, 'id'>[] })[]> {
  const { user, client } = await authenticate(event)

  let query = client.from('books').select('*, collections(id)')

  if (page !== undefined && pageSize !== undefined) {
    query = query
      .limit(pageSize)
      .range(page * pageSize, (page + 1) * pageSize - 1)
  }

  if (bookProgress !== undefined) {
    query = query.eq('progress_status', bookProgress)
  }

  const { data, error } = await query

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  const bookCovers: (string | null)[] =
    withBookCovers && data
      ? await executePromisesInChunks(
          data.map((book) => getBookCoverUrl(client, user.id, book.id)),
        )
      : []

  return (
    data.map((book, index) => ({
      ...book,
      cover_src: bookCovers[index],
    })) ?? []
  )
}

export async function createBook(
  event: H3Event<EventHandlerRequest>,
  book: Book,
  collections: CollectionDB[],
  tempCoverSrc?: string,
): Promise<(BookDB & { collections: Pick<CollectionDB, 'id'>[] }) | null> {
  const { user, client } = await authenticate(event)

  const { data, error } = await client
    .from('books')
    .upsert([bookToDbBook(book, user.id)], {
      onConflict: 'id',
      defaultToNull: true,
    })
    .select('*, collections(id)')

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  if (tempCoverSrc) {
    const { error: storageError } = await client.storage
      .from('book-covers')
      .move(`${user.id}/${tempCoverSrc}`, `${user.id}/${data[0].id}`)

    if (storageError && storageError.message !== 'Object not found') {
      logger.error(storageError)
      throw createError(storageError.message)
    }
  }

  const bookId = data?.[0].id ?? book.id

  const { error: deleteBookCollectionError } = await client
    .from('collection-book')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)

  if (deleteBookCollectionError) {
    logger.error(deleteBookCollectionError)
    throw createError(deleteBookCollectionError)
  }

  const { error: bookCollectionError } = await client
    .from('collection-book')
    .insert(
      collections.map((collection) => ({
        book_id: bookId,
        collection_id: collection.id,
        user_id: user.id,
        order: -1, // TODO: fix
      })),
    )

  if (bookCollectionError) {
    logger.error(bookCollectionError)
    throw createError(bookCollectionError)
  }

  return data[0]
}

export async function deleteBook(
  event: H3Event<EventHandlerRequest>,
  id: BookDB['id'],
): Promise<BookDB['id'] | null> {
  const { client } = await authenticate(event)

  const { error } = await client.from('books').delete().eq('id', +id)

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  return id
}

export async function deleteBooks(
  event: H3Event<EventHandlerRequest>,
  ids: BookDB['id'][],
): Promise<BookDB['id'][]> {
  const { client } = await authenticate(event)

  const { data, error } = await client
    .from('books')
    .delete()
    .in('id', ids)
    .select('id')

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  return data.map(({ id }) => id)
}

export async function getBookCount(
  event: H3Event<EventHandlerRequest>,
): Promise<number | null> {
  const { client } = await authenticate(event)

  const { count } = await client
    .from('books')
    .select('*', { count: 'exact', head: true })

  return count
}

export async function getBookCover(
  event: H3Event<EventHandlerRequest>,
  id: string,
): Promise<string | null> {
  const { user, client } = await authenticate(event)

  try {
    const { data, error } = await client.storage
      .from(`book-covers/${user.id}`)
      .createSignedUrl(id, 24 * 60 * 60)

    if (error) {
      logger.error(error)
      if (error.message === 'Object not found') {
        return null
      }
      throw createError(error.message)
    }

    return data.signedUrl
  } catch (error) {
    logger.error(error)
    throw createError(error as Error)
  }
}

export async function updateBookCover(
  event: H3Event<EventHandlerRequest>,
  bookId: string,
  formData: FormData,
): Promise<string | null> {
  const { user, client } = await authenticate(event)

  try {
    const { error } = await client.storage
      .from(`book-covers/${user.id}`)
      .upload(bookId, formData, {
        cacheControl: '3600',
        upsert: true,
      })

    if (error) {
      logger.error(error)
      throw createError(error.message)
    }

    return getBookCoverUrl(client, user.id, bookId)
  } catch (error) {
    logger.error(error)
    throw createError(error as Error)
  }
}

export async function getCollection(
  event: H3Event<EventHandlerRequest>,
  id: number,
): Promise<
  | (CollectionDB & {
      'collection-book': { book_id: BookDB['id']; order: number }[]
    })
  | null
> {
  const { client } = await authenticate(event)

  const { data, error } = await client
    .from('collections')
    .select(
      `
      *,
      "collection-book" (
        order,
        book_id
      )
    `,
    )
    .eq('id', +id)

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  return data[0]
}

export async function getCollections(
  event: H3Event<EventHandlerRequest>,
): Promise<
  (CollectionDB & {
    'collection-book': { book_id: BookDB['id']; order: number }[]
  })[]
> {
  const { client } = await authenticate(event)

  const { data, error } = await client.from('collections').select(
    `
      *,
      "collection-book" (
        order,
        book_id
      )
    `,
  )

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  return data ?? []
}

export async function createCollection(
  event: H3Event<EventHandlerRequest>,
  collection: Collection,
): Promise<
  | (CollectionDB & {
      'collection-book': { book_id: Book['id']; order: number }[]
    })
  | null
> {
  const { user, client } = await authenticate(event)

  const { data, error } = await client
    .from('collections')
    .upsert([collectionToDbCollection(collection, user.id)], {
      onConflict: 'id',
      defaultToNull: true,
    }).select(`
        *,
        "collection-book" (
          order,
          book_id
        )
      `)

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  const collectionId = data?.[0].id ?? collection.id

  const { error: deleteBookCollectionError } = await client
    .from('collection-book')
    .delete()
    .eq('user_id', user.id)
    .eq('collection_id', collectionId)

  if (deleteBookCollectionError) {
    logger.error(deleteBookCollectionError)
    throw createError(deleteBookCollectionError)
  }

  const { error: bookCollectionError } = await client
    .from('collection-book')
    .insert(
      collection.books.map(({ id: bookId, order }) => ({
        book_id: bookId,
        collection_id: collectionId,
        user_id: user.id,
        order,
      })),
    )

  if (bookCollectionError) {
    logger.error(bookCollectionError)

    // revert the changes manually until Supabase supports transactions
    const originalCollection = data.find(({ id }) => id === collectionId)

    if (originalCollection) {
      await insertBooksInCollection(
        client,
        user.id,
        collectionId,
        originalCollection['collection-book'].map(({ book_id, order }) => ({
          id: book_id,
          order,
        })),
      )
    }

    throw createError(bookCollectionError)
  }

  return data[0]
}

export async function deleteCollection(
  event: H3Event<EventHandlerRequest>,
  id: CollectionDB['id'],
): Promise<CollectionDB['id'] | null> {
  const { client } = await authenticate(event)

  const { error } = await client.from('collections').delete().eq('id', +id)

  if (error) {
    logger.error(error)
    throw createError(error)
  }

  return id
}

export async function deleteUser(
  event: H3Event<EventHandlerRequest>,
): Promise<string | null> {
  const { user, client } = await authenticate(event)

  const { data, error } = await client.auth.admin.deleteUser(user.id)

  if (error) {
    logger.error(error)
    throw createError(error.message)
  }

  if (data) {
    return data.user.id
  }

  return null
}

export async function isLibraryEmpty(
  event: H3Event<EventHandlerRequest>,
): Promise<boolean> {
  const { client } = await authenticate(event)

  const { count } = await client
    .from('books')
    .select('*', { count: 'exact', head: true })

  return count === 0 || count === null || count === undefined
}
