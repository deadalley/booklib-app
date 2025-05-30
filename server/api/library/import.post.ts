import { db } from '~/services/db.service'
import { bookToDbBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const books = await readBody(event)

  if (books.length) {
    return db.importLibrary(event, books.map(bookToDbBook))
  }
})
