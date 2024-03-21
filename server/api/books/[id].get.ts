import { serverSupabaseClient } from '#supabase/server'
import { Book } from '~/types/book'
import { Database } from '~/types/db.generate'
import { dbBooktoBook } from '~/utils'

export default defineEventHandler<Promise<Book | undefined>>(async (event) => {
  const client = await serverSupabaseClient<Database>(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw new Error('No id provided')
  } else {
    const { data } = await client.from('books').select('*').eq('id', id)

    if (data) {
      return dbBooktoBook(data[0])
    }
  }
})
