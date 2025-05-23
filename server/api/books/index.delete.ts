import { db } from '~/services/db.service'
import type { Book } from '~/types/book'

export default defineEventHandler<Promise<Book['id'][]>>(async (event) => {
  const bookIds = await readBody(event)

  if (!bookIds.length) {
    throw createError('No ids provided')
  }

  return db.deleteBooks(event, bookIds)
})
