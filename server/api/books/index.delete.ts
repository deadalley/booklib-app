import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Book } from '~/types/book'
import type { Database } from '~/types/db.generate'

export default defineEventHandler<Promise<Book['id'][]>>(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  }

  const bookIds = await readBody(event)

  if (!bookIds.length) {
    throw createError('No books selected for deletion')
  }

  const { data, error } = await client
    .from('books')
    .delete()
    .in('id', bookIds)
    .select('id')

  if (error) {
    throw createError(error.message)
  }

  if (data) {
    return data.map(({ id }) => id)
  }

  throw createError('Could not delete books')
})
