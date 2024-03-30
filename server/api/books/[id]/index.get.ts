import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Book } from '~/types/book'
import { Database } from '~/types/db.generate'
import { dbBooktoBook } from '~/utils'

export default defineEventHandler<Promise<Book | undefined>>(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  } else {
    const { data, error } = await client.from('books').select('*').eq('id', id)

    if (error) {
      throw createError(error.message)
    }

    const coverSrc = await getBookCoverUrl(client, user?.id, data[0].id)

    if (data) {
      return dbBooktoBook({ ...data[0], cover_src: coverSrc })
    }
  }
})
