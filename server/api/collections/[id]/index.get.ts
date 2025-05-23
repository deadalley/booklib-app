import { db } from '~/services/db.service'
import type { Collection } from '~/types/collection'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler<Promise<Collection | null>>(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  }

  const data = await db.getCollection(event, +id)

  return data && dbCollectionToCollection(data, data['collection-book'])
})
