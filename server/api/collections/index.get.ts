import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getCollections } from '~/server/utils/get-collections'
import type { Database } from '~/types/db.generate'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await getCollections(client)

    if (error) {
      throw createError(error.message)
    }

    return data?.map((collection) =>
      dbCollectionToCollection(collection, collection['collection-book']),
    )
  }
})
