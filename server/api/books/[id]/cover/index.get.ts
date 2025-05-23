import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || id === 'undefined') {
    throw createError('No id provided')
  }

  return db.getBookCover(event, id)
})
