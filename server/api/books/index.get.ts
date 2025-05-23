import { dbBookToBook } from '~/utils'
import type { GetBooksQuerySearchParams } from '~/types/api'
import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const query = getQuery<GetBooksQuerySearchParams>(event)

  const data = await db.getBooks(event, query)

  return (data ?? [])?.map((b) => dbBookToBook(b, b.collections))
})
