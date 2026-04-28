import type { Author } from './author'
import type { Collection } from './collection'

export type BookProgressStatus =
  | 'owned'
  | 'not-owned'
  | 'reading'
  | 'paused'
  | 'read'
  | 'not-finished'

export type BookFormat =
  | 'hardcover'
  | 'paperback'
  | 'ebook'
  | 'audiobook'
  | 'other'

export type BookNote = {
  createdAt: string
  page?: number
  content: string
}

export type BookProgress = {
  startedAt: string | null
  finishedAt: string | null
  status: BookProgressStatus | null
  notes: BookNote[]
}

export type Book = {
  id: string
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
  collections: Collection['id'][]
  format: BookFormat | null
  author: Author['id'] | null
  progress: BookProgress
}

export type ViewBook = Book & {
  authorName?: string
  selected?: boolean
  order?: number
  isFavorite?: boolean
  isWishlist?: boolean
}
