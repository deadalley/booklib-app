import type { Database } from './db.generate'

export type BookDB = Database['public']['Tables']['books']['Row'] & {
  collections: Pick<CollectionDB, 'id'>[]
  cover_src: string | null
}
export type CollectionDB =
  Database['public']['Tables']['collections']['Row'] & {
    'collection-book': { book_id: BookDB['id']; order: number }[]
  }
