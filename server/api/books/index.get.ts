import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { dbBookToBook, executePromisesInChunks } from '~/utils'
import { getPaginatedBooks } from '~/server/utils/get-paginated-books'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const query = getQuery<{ page?: number; pageSize?: number }>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await getPaginatedBooks(
      client,
      query.page && +query.page,
      query.pageSize && +query.pageSize,
    )

    if (error) {
      logger.error(error)
      throw createError(error)
    }

    const bookCovers: (string | undefined)[] = await executePromisesInChunks(
      (data ?? []).map((book) => getBookCoverUrl(client, user.id, book.id)),
    )

    return data?.map((b, index) =>
      dbBookToBook(
        { ...b, cover_src: bookCovers[index] ?? null },
        b.collections,
      ),
    )
  }
})
