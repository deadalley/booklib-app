import { db } from '~/services/db.service'
import type { GetOrderedBooksQuerySearchParams } from '~/types/api'

export default defineEventHandler(async (event) => {
  const query = getQuery<GetOrderedBooksQuerySearchParams>(event)

  if (query.property === undefined) {
    throw createError('Missing property in query params')
  }

  return db.getOrderedBooks(query)
})
