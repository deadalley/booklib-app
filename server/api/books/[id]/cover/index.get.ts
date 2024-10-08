import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/db.generate'
import { logger } from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const id = getRouterParam(event, 'id')

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else if (!id || id === 'undefined') {
    throw createError('No id provided')
  } else {
    try {
      const { data, error } = await client.storage
        .from(`book-covers/${user.id}`)
        .createSignedUrl(id, 24 * 60 * 60)

      if (error) {
        logger.error(error)
        if (error.message === 'Object not found') {
          return undefined
        }
        throw createError(error.message)
      }

      return data.signedUrl
    } catch (error) {
      throw createError(error as Error)
    }
  }
})
