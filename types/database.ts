import type { Database } from './db.generate'

export type BookDB = Database['public']['Tables']['books']['Row']
export type CollectionDB = Database['public']['Tables']['collections']['Row']
