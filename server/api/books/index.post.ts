import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { Database } from '~/types/db.generate'
import { bookToDbBook, dbBooktoBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const book = await readBody(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await client
      .from('books')
      .upsert([bookToDbBook(book, user.id)], {
        onConflict: 'id',
        defaultToNull: true,
      })
      .select('*')

    if (error) {
      throw createError({ statusMessage: error.message })
    }

    return dbBooktoBook(data[0])
  }
})
