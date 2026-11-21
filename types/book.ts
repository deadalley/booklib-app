import type { Author } from './author'
import type { Collection } from './collection'

export type BookPropertyStatus = 'owned' | 'not-owned'

export type BookProgressStatus = 'reading' | 'paused' | 'read' | 'not-finished'

export type BookFormat =
  | 'hardcover'
  | 'paperback'
  | 'ebook'
  | 'audiobook'
  | 'other'

export type BookNote = {
  id?: string
  createdAt: string
  page?: number
  content: string
  // A highlight from the ebook reader: `content` is the quoted text and this
  // is where it is (an EPUB CFI, or "page:<n>" in a PDF)
  highlight?: { location: string }
}

export type EbookFormat = 'epub' | 'pdf'

/** The ebook file attached to a book, read in the built-in reader */
export type BookEbook = {
  format: EbookFormat
  fileName: string
  size: number
  addedAt: string
  // Where reading stopped: an EPUB CFI, or "page:<n>" in a PDF
  location: string | null
  // How far through, 0–1
  progress: number
}

export type BookProgress = {
  startedAt: string | null
  finishedAt: string | null
  status: BookProgressStatus | null
  notes: BookNote[]
  currentPage: number | null
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
  propertyStatus: BookPropertyStatus | null
  ebook?: BookEbook | null
}

export type ViewBook = Book & {
  authorName?: string
  selected?: boolean
  order?: number
  isFavorite?: boolean
}
