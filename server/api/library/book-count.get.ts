import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { count } = await client
      .from('books')
      .select('*', { count: 'exact', head: true })

    return count
  }
})
