import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { bookToDbBook, dbBooktoBook, logger } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const book = await readBody(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await client
      .from('books')
      .upsert([bookToDbBook(book, user.id)], {
        onConflict: 'id',
        defaultToNull: true,
      })
      .select('*')

    if (error) {
      logger.error(error)
      throw createError({ statusMessage: error.message })
    }

    if (book.tempCoverSrc) {
      const { error: storageError } = await client.storage
        .from('book-covers')
        .move(`${user.id}/${book.tempCoverSrc}`, `${user.id}/${data[0].id}`)

      if (storageError && storageError.message !== 'Object not found') {
        logger.error(storageError)
        throw createError(storageError.message)
      }
    }

    return dbBooktoBook(data[0])
  }
})
