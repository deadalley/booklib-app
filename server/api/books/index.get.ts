import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { dbBookToBook, executePromisesInChunks, logger } from '~/utils'
import { getPaginatedBooks } from '~/server/utils/get-paginated-books'
import type { Book, BookProgressStatus } from '~/types/book'

export default defineEventHandler<Promise<Book[]>>(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const query = getQuery<{
    page?: number
    pageSize?: number
    bookProgress?: BookProgressStatus
    withBookCovers?: boolean
  }>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await getPaginatedBooks(
      client,
      query.page && +query.page,
      query.pageSize && +query.pageSize,
      query.bookProgress,
    )

    if (error) {
      logger.error(error)
      throw createError(error)
    }

    const bookCovers: (string | undefined)[] = query.withBookCovers
      ? await executePromisesInChunks(
          (data ?? []).map((book) => getBookCoverUrl(client, user.id, book.id)),
        )
      : []

    return (data ?? [])?.map((b, index) =>
      dbBookToBook(
        { ...b, cover_src: bookCovers[index] ?? null },
        b.collections,
      ),
    )
  }
})
