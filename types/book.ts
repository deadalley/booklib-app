import type { Author } from './author'
import type { Collection } from './collection'

export type BookProgressStatus =
  | 'owned'
  | 'not-owned'
  | 'not-read'
  | 'reading'
  | 'paused'
  | 'read'
  | 'not-finished'

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
  progressStatus: BookProgressStatus | null
  startedAt: string | null
  finishedAt: string | null
  author: Author['id'] | null
}

export type ViewBook = Book & {
  authorName?: string
  selected?: boolean
  order?: number
  isFavorite?: boolean
  isWishlist?: boolean
}
