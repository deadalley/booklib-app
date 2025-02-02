import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookProgressStatus } from '~/types/book'
import type { Database } from '~/types/db.generate'

export function getPaginatedBooks(
  client: SupabaseClient<Database>,
  page?: number,
  pageSize?: number,
  bookProgress?: BookProgressStatus,
) {
  let query = client.from('books').select('*, collections(id)')
  if (page !== undefined && pageSize !== undefined) {
    query = query
      .limit(pageSize)
      .range(page * pageSize, (page + 1) * pageSize - 1)
  }

  if (bookProgress !== undefined) {
    query = query.eq('progress_status', bookProgress)
  }
  return query
}
