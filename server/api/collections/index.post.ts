import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import {
  collectionToDbCollection,
  dbCollectionToCollection,
  logger,
} from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const collection = await readBody(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await client
      .from('collections')
      .upsert([collectionToDbCollection(collection, user.id)], {
        onConflict: 'id',
        defaultToNull: true,
      })
      .select('*, books(id)')

    if (error) {
      logger.error(error)
      throw createError({ statusMessage: error.message })
    }

    return dbCollectionToCollection(data[0], data[0].books)
  }
})
