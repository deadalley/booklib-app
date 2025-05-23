import { db } from '~/services/db.service'
import { dbCollectionToCollection } from '~/utils'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  }

  const data = await db.getCollection(event, id)

  return data && dbCollectionToCollection(data, data['collection-book'])
})
