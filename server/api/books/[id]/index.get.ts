import { db } from '~/services/db.service'
import type { Book } from '~/types/book'
import { dbBookToBook } from '~/utils'

export default defineEventHandler<Promise<Book | null>>(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  } else {
    const data = await db.getBook(event, +id)

    return data && dbBookToBook(data, data.collections)
  }
})
