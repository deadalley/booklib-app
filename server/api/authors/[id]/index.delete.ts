import { db } from '~/services/db.service'
import type { DeleteAuthorParams } from '~/types/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery<{ deleteBooks: string }>(event)

  if (!id) {
    throw createError('No id provided')
  }

  const correctedQuery: DeleteAuthorParams = {
    deleteBooks: query.deleteBooks === 'true',
  }

  return db.deleteAuthor(event, id, correctedQuery)
})
