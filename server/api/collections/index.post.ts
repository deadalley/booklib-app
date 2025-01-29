import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { insertBooksInCollection } from '~/server/utils/insert-books-in-collection'
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
      }).select(`
        *,
        "collection-book" (
          order,
          book_id
        )
      `)

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

    const { error: bookCollectionError } = await insertBooksInCollection(
      client,
      user.id,
      collectionId,
      collection.books,
    )

    if (bookCollectionError) {
      logger.error(bookCollectionError)

      // revert the changes manually until Supabase supports transactions
      const originalCollection = data.find(({ id }) => id === collectionId)

      if (originalCollection) {
        await insertBooksInCollection(
          client,
          user.id,
          collectionId,
          originalCollection['collection-book'].map(({ book_id, order }) => ({
            id: book_id,
            order,
          })),
        )
      }

      throw createError({ statusMessage: bookCollectionError.message })
    }

    return dbCollectionToCollection(data[0], data[0]['collection-book'])
  }
})
