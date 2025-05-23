import { db } from '~/services/db.service'
import type { Book } from '~/types/book'

export default defineEventHandler<Promise<Book['id'] | null>>(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  }

  return db.deleteBook(event, +id)
})
