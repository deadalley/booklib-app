import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { dbBookToBook, executePromisesInChunks } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data } = await client.from('books').select('*, collections(id)')

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
