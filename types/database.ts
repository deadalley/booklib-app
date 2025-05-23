import type { Database } from './db.generate'

export type BookDB<ID extends number | string = number> = Omit<
  Database['public']['Tables']['books']['Row'],
  'id'
> & {
  id: ID
  collections: Pick<CollectionDB<ID>, 'id'>[]
  cover_src: string | null
}
export type CollectionDB<ID extends number | string = number> = Omit<
  Database['public']['Tables']['collections']['Row'],
  'id'
> & {
  'collection-book': { book_id: BookDB<ID>['id']; order: number }[]
} & {
  id: ID
}
