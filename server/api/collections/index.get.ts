import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data } = await client.from('collections').select(`
        *,
        "collection-book" (
          order,
          book_id
        )
      `)

    return data?.map((collection) =>
      dbCollectionToCollection(collection, collection['collection-book']),
    )
  }
})
