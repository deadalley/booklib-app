import { db } from '~/services/db.service'
import type { DeleteCollectionParams } from '~/types/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery<{ deleteBooks: string }>(event)

  if (!id) {
    throw createError('No id provided')
  }

  const correctedQuery: DeleteCollectionParams = {
    deleteBooks: query.deleteBooks === 'true',
  }

  return db.deleteCollection(event, id, correctedQuery)
})
