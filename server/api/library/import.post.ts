import { db } from '~/services/db.service'

export default defineEventHandler(async (event) => {
  const books = await readBody(event)

  if (books.length) {
    return db.importLibrary(event, books.map(bookToDbBook))
  }
})
