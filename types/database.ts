import type { Database } from './db.generate'

export type AuthorDB<ID extends number | string = number> = Omit<
  Database['public']['Tables']['authors']['Row'],
  'id'
> & {
  id: ID
}
export type BookDB<ID extends number | string = number> = Omit<
  Database['public']['Tables']['books']['Row'],
  'id' | 'author_id'
> & {
  id: ID
  author_id: ID | null
  collections: Pick<CollectionDB<ID>, 'id'>[]
  cover_src: string | null
}
export type CollectionDB<ID extends number | string = number> = Omit<
  Database['public']['Tables']['collections']['Row'],
  'id'
> & {
  id: ID
}
