import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { GetBooksQuerySearchParams } from '~/types/api'
import type { Database } from '~/types/db.generate'
import type { BookDB, CollectionDB } from '~/types/database'
import type { H3Event, EventHandlerRequest } from 'h3'
import { executePromisesInChunks } from '../utils'

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
