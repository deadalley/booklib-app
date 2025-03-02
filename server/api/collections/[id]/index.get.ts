import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { getCollections } from '~/server/utils/get-collections'
import type { Collection } from '~/types/collection'
import type { Database } from '~/types/db.generate'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler<Promise<Collection | undefined>>(
  async (event) => {
    const user = await serverSupabaseUser(event)
    const client = await serverSupabaseClient<Database>(event)

    const id = getRouterParam(event, 'id')

    if (!user?.id) {
      throw createError('Unauthenticated')
    }

    if (!id) {
      throw createError('No id provided')
    } else {
      const { data, error } = await getCollections(client).eq('id', +id)

      if (error) {
        logger.error(error)
        throw createError(error.message)
      }

      if (data) {
        return dbCollectionToCollection(data[0], data[0]['collection-book'])
      }
    }
  },
)
