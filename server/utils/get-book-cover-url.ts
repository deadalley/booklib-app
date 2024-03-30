import { logger } from '~/utils'

export async function getBookCoverUrl(
  client: any,
  userId?: string,
  bookId?: string | number,
) {
  try {
    const { data, error } = await client.storage
      .from(`book-covers/${userId}`)
      .createSignedUrl(bookId, 24 * 60 * 60)

    if (error) {
      if (error.message === 'Object not found') {
        return undefined
      }
      logger.error(error)
      throw createError(error.message)
    }

    return data.signedUrl
  } catch (error) {
    throw createError(error as Error)
  }
}
