import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { logger } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const formData = await readFormData(event)

  const bookId = (formData.get('bookId') as File).name

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    try {
      const { error } = await client.storage
        .from(`book-covers/${user.id}`)
        .upload(bookId, formData, {
          cacheControl: '3600',
          upsert: true,
        })

      if (error) {
        logger.error(error)
        throw createError(error.message)
      }

      return getBookCoverUrl(client, user.id, bookId)
    } catch (error) {
      throw createError(error as Error)
    }
  }
})
