import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/db.generate'
import { bookToDbBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const book = await readBody(event)

  if (!user?.id) {
    throw new Error('Unauthenticated')
  } else {
    const { data } = await client
      .from('books')
      .upsert(bookToDbBook(book, user.id))
    return data
  }
})
