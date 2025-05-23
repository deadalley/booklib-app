import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/db.generate'
import { logger } from '~/utils'

export async function getBookCoverUrl(
  client: SupabaseClient<Database>,
  userId: string,
  bookId: string | number,
): Promise<string | null> {
  try {
    const { data, error } = await client.storage
      .from(`book-covers/${userId}`)
      .createSignedUrl(`${bookId}`, 24 * 60 * 60)

    if (error) {
      if (error.message === 'Object not found') {
        return null
      }
      logger.error(error)
      throw createError(error.message)
    }

    return data.signedUrl
  } catch (error) {
    throw createError(error as Error)
  }
}
