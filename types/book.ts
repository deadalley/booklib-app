import type { Collection } from './collection'
import type { Database } from './db.generate'

export type BookProgressStatus = Database['public']['Enums']['BookProgress']

export type Book = {
  id: number
  title: string
  coverSrc?: string
  createdAt: string
  isbn?: string
  language?: string
  originalTitle?: string
  originalLanguage?: string
  pages?: number
  publisher?: string
  rating?: number
  summary?: string
  year?: number
  genres?: string[]
  collections: Collection['id'][]
  progressStatus?: BookProgressStatus
  startedAt?: string
  finishedAt?: string
}

export type ViewBook = Book & { selected?: boolean; order?: number }
