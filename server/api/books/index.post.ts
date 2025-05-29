import { db } from '~/services/db.service'
import type { BookDB } from '~/types/database'
import { v4 as uuidv4 } from 'uuid'
import { dbBookToBook } from '~/utils'

export default defineEventHandler(async (event) => {
  const book = await readBody(event)

  const bookDb: BookDB = {
    ...bookToDbBook(book),
    id: book.id ?? uuidv4(),
    author_id: book.author ?? null,
    created_at: new Date().toISOString(),
  }

  const data = await db.createBook(event, bookDb, book.collections)

  return data && dbBookToBook(data, data.collections)
})
