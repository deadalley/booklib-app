import { db } from '~/services/db.service'
import type { Collection } from '~/types/collection'

export default defineEventHandler<Promise<Collection['id'] | null>>(
  async (event) => {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError('No id provided')
    }

    return db.deleteCollection(event, +id)
  },
)
