import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const bookIds = await readBody(event)

  if (!bookIds.length) {
    throw createError('No ids provided')
  }

  return db.deleteBooks(event, bookIds)
})
