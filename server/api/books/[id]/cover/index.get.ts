import { db } from '~/services/db.service'
import { createReadStream } from 'fs'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || id === 'undefined') {
    throw createError('No id provided')
  }

  const filePath = await db.getBookCover(id)

  if (filePath) {
    return sendStream(event, createReadStream(filePath))
  }
})
