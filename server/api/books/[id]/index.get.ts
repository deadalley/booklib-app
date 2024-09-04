import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Book } from '~/types/book'
import type { Database } from '~/types/db.generate'
import { dbBookToBook } from '~/utils'

export default defineEventHandler<Promise<Book | undefined>>(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  } else {
    const { data, error } = await client
      .from('books')
      .select('*, collections(id)')
      .eq('id', id)

    if (error) {
      throw createError(error.message)
    }

    const coverSrc = await getBookCoverUrl(client, user?.id, data[0].id)

    if (data) {
      return dbBookToBook(
        { ...data[0], cover_src: coverSrc ?? '' },
        data[0].collections,
      )
    }
  }
})
