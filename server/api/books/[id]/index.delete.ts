import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  }

  return db.deleteBook(event, id)
})
