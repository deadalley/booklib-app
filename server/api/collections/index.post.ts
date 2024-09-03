import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Collection } from '~/types/collection'
import type { Database } from '~/types/db.generate'
import {
  collectionToDbCollection,
  dbCollectionToCollection,
  logger,
} from '~/utils'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  const collection: Collection = await readBody(event)

  if (!user?.id) {
    throw createError('Unauthenticated')
  } else {
    const { data, error } = await client
      .from('collections')
      .upsert([collectionToDbCollection(collection, user.id)], {
        onConflict: 'id',
        defaultToNull: true,
      })
      .select('*, books(id)')

    if (error) {
      logger.error(error)
      throw createError({ statusMessage: error.message })
    }

    const collectionId = data?.[0].id ?? collection.id

    const { error: deleteBookCollectionError } = await client
      .from('collection-book')
      .delete()
      .eq('user_id', user.id)
      .eq('collection_id', collectionId)

    if (deleteBookCollectionError) {
      logger.error(deleteBookCollectionError)
      throw createError({ statusMessage: deleteBookCollectionError.message })
    }

    const { error: bookCollectionError } = await client
      .from('collection-book')
      .insert(
        collection.books.map((bookId) => ({
          book_id: bookId,
          collection_id: collectionId,
          user_id: user.id,
        })),
      )

    if (bookCollectionError) {
      logger.error(bookCollectionError)
      throw createError({ statusMessage: bookCollectionError.message })
    }

    return dbCollectionToCollection(data[0], data[0].books)
  }
})
