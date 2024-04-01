import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/db.generate'
import { dbBooktoBook, executePromisesInChunks } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const { data } = await client.from('books').select('*')

  let bookCovers: string[] = []
  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    bookCovers = await executePromisesInChunks(
      (data ?? []).map((book) => getBookCoverUrl(client, user?.id, book.id)),
    )
  }

  return data?.map((b, index) =>
    dbBooktoBook({ ...b, cover_src: bookCovers[index] }),
  )
})
