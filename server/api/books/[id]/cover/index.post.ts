import type { ServerFile } from 'nuxt-file-storage'
import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const { bookId, file } = await readBody<{
    bookId: string
    file: ServerFile
  }>(event)

  if (!bookId) {
    throw createError('No id provided')
  }

  return db.updateBookCover(bookId, file)
})
