import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Book } from '~/types/book'
import type { Database } from '~/types/db.generate'
import { bookToDbBook, dbBookToBook, logger } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const books = await readBody<Book[]>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else if (books?.length) {
    const { data, error } = await client
      .from('books')
      .upsert(
        books.map(({ id, ...book }) => bookToDbBook(book, user.id)),
        {
          onConflict: 'id',
          defaultToNull: true,
        },
      )
      .select('*, collections(id)')

    if (error) {
      logger.error(error)
      throw createError({ statusMessage: error.message })
    }

    return dbBookToBook(data[0], data[0].collections)
  } else {
    throw createError({ statusMessage: 'No books were imported' })
  }
})
