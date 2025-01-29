import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/db.generate'

export function getCollections(client: SupabaseClient<Database>) {
  return client.from('collections').select(
    `
      *,
      "collection-book" (
        order,
        book_id
      )
    `,
  )
}
