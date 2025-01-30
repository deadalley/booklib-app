import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { logger } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { error: booksDeletionError } = await client
      .from('books')
      .delete()
      .eq('user_id', user.id)

    if (booksDeletionError) {
      logger.error(booksDeletionError)
      throw createError({ statusMessage: booksDeletionError.message })
    }

    const { error: collectionsDeletionError } = await client
      .from('collections')
      .delete()
      .eq('user_id', user.id)

    if (collectionsDeletionError) {
      logger.error(collectionsDeletionError)
      throw createError({ statusMessage: collectionsDeletionError.message })
    }

    return true
  }
})
