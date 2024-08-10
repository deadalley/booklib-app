import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
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
      const { data, error } = await client
        .from('collections')
        .select('*, books(id)')
        .eq('id', id)

      if (error) {
        throw createError(error.message)
      }

      if (data) {
        return dbCollectionToCollection(data[0], data[0].books)
      }
    }
  },
)
