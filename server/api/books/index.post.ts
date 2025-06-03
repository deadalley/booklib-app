import { db } from '~/services/db.service'
import type { BookDB } from '~/types/database'
import { v4 as uuidv4 } from 'uuid'
import { bookToDbBook, dbBookToBook, now } from '~/utils'

export default defineEventHandler(async (event) => {
  const book = await readBody(event)

  const bookDb: BookDB = {
    ...bookToDbBook(book),
    id: book.id ?? uuidv4(),
    author_id: book.author || null,
    created_at: book.created_at || now(),
    collections: book.collections.map(({ id }: { id: string }) => id),
  }

  const data = await db.createBook(bookDb, bookDb.collections)

  return data && dbBookToBook(data, data.collections)
})
