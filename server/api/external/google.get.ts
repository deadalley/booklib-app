import { googleBookToBook, logger } from '~/utils'
import type { Book } from '~/types/book'
import { getByTitle } from '~/services/google-books.service'

export default defineEventHandler<Promise<Book[]>>(async (event) => {
  const query = getQuery<{
    title?: string
    pageSize?: number
  }>(event)

  try {
    if (query.title) {
      const { items: googleBooks } = await getByTitle(query.title, {
        maxResults: query.pageSize,
      })

      return googleBooks.map((book) => googleBookToBook(book))
    } else {
      throw createError('No filter was provided')
    }
  } catch (error) {
    logger.error(error)
    throw createError(error as Error)
  }
})
