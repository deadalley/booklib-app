import type { SupabaseClient } from '@supabase/supabase-js'
import type { Collection } from '~/types/collection'
import type { Database } from '~/types/db.generate'

export function insertBooksInCollection(
  client: SupabaseClient<Database>,
  userId: string,
  collectionId: Collection['id'],
  books: Collection['books'],
) {
  return client.from('collection-book').insert(
    books.map(({ id: bookId, order }) => ({
      book_id: bookId,
      collection_id: collectionId,
      user_id: userId,
      order,
    })),
  )
}
