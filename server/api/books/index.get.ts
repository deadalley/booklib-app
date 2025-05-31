import { dbBookToBook } from '~/utils'
import type { GetBooksQuerySearchParams } from '~/types/api'
import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const query = getQuery<GetBooksQuerySearchParams>(event)

  const books = await db.getBooks(query)

  return (books ?? [])?.map((b) => dbBookToBook(b, b.collections))
})
