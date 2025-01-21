import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { BookDB } from '~/types/database'
import type { Database } from '~/types/db.generate'

type Property = keyof Pick<BookDB, 'pages' | 'year'>

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const query = getQuery<{ property: Property; count?: number }>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    if (query.property === undefined) {
      throw createError('Missing property in query params')
    }

    const { data } = await client
      .from('books')
      .select(`id, title, ${query.property}`)
      .not(query.property, 'is', null)
      .order(query.property, { ascending: false })
      .limit(query.count ?? 10)

    return data
  }
})
