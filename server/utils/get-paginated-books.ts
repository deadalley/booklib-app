import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/db.generate'

export function getPaginatedBooks(
  client: SupabaseClient<Database>,
  page?: number,
  pageSize?: number,
) {
  if (page !== undefined && pageSize !== undefined) {
    return client
      .from('books')
      .select('*, collections(id)')
      .limit(pageSize)
      .range(page * pageSize, (page + 1) * pageSize - 1)
  } else {
    return client.from('books').select('*, collections(id)')
  }
}
