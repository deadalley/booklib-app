import type { BookProgressStatus } from './book'

export type AuthorDB = {
  id: string
  created_at: string
  name: string
}
export type BookDB = {
  id: string
  author_id: string | null
  cover_src: string | null
  created_at: string
  finished_at: string | null
  genres: string[] | null
  isbn: string | null
  language: string | null
  original_language: string | null
  original_title: string | null
  pages: number | null
  progress_status: BookProgressStatus | null
  publisher: string | null
  rating: number | null
  started_at: string | null
  summary: string | null
  title: string
  year: number | null
  collections: CollectionDB['id'][]
}

export type CollectionDB = {
  id: string
  created_at: string
  name: string
}
