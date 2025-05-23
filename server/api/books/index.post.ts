import { db } from '~/services/db.service'
import { dbBookToBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const book = await readBody(event)

  const data = await db.createBook(
    event,
    book,
    book.collections,
    book.tempCoverSrc,
  )

  return data && dbBookToBook(data, data.collections)
})
