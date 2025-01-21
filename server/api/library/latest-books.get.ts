import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { executePromisesInChunks } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data } = await client
      .from('books')
      .select('id, title, cover_src')
      .order('created_at', { ascending: false })
      .limit(10)

    const bookCovers: (string | undefined)[] = await executePromisesInChunks(
      (data ?? []).map((book) => getBookCoverUrl(client, user.id, book.id)),
    )

    return data?.map((book, index) => ({
      ...book,
      coverSrc: bookCovers[index] ?? null,
    }))
  }
})
