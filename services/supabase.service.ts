import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { GetBooksQuerySearchParams } from '~/types/api'
import type { Database } from '~/types/db.generate'
import type { BookDB, CollectionDB } from '~/types/database'
import type { H3Event, EventHandlerRequest } from 'h3'
import { bookToDbBook, executePromisesInChunks, logger } from '../utils'
import type { Book } from '~/types/book'

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
    throw createError({ statusMessage: deleteBookCollectionError.message })
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
