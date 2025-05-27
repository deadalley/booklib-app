import type { Collection } from './collection'
import type { Database } from './db.generate'

export type BookProgressStatus = Database['public']['Enums']['BookProgress']

export type Book<ID extends number | string = number> = {
  id: ID
  title: string
  coverSrc: string | null
  createdAt: string
  isbn: string | null
  language: string | null
  originalTitle: string | null
  originalLanguage: string | null
  pages: number | null
  publisher: string | null
  rating: number | null
  summary: string | null
  year: number | null
  genres: string[] | null
  collections: Collection<ID>['id'][]
  progressStatus: BookProgressStatus | null
  startedAt: string | null
  finishedAt: string | null
  author: ID | null
}

export type ViewBook = Book & { selected?: boolean; order?: number }
