import { db } from '~/services/db.service'
import { dbBookToBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError('No id provided')
  }

  const data = await db.getBook(event, id)

  return data && dbBookToBook(data, data.collections)
})
