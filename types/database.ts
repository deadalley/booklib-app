import type {
  BookFormat,
  BookNote,
  BookProgressStatus,
  BookPropertyStatus,
} from './book'
import type { ChallengeLevel, GoalInterval, GoalStatus, GoalType } from './goal'

export type AuthorDB = {
  id: string
  // Last change, set on every write; sync keeps the newest (see services/sync)
  updated_at?: string
  created_at: string
  name: string
}
export type BookDB = {
  id: string
  // Last change, set on every write; sync keeps the newest (see services/sync)
  updated_at?: string
  author_id: string | null
  cover_src: string | null
  created_at: string
  finished_at: string | null
  current_page?: number | null
  genres: string[] | null
  notes: BookNote[]
  isbn: string | null
  language: string | null
  original_language: string | null
  original_title: string | null
  pages: number | null
  progress_status: BookProgressStatus | null
  property_status: BookPropertyStatus | null
  format: BookFormat | null
  publisher: string | null
  rating: number | null
  started_at: string | null
  summary: string | null
  title: string
  year: number | null
  collections: CollectionDB['id'][]
  // The attached ebook file (stored separately, see services/ebooks.ts)
  ebook?: import('./book').BookEbook | null
}

export type CollectionDB = {
  id: string
  // Last change, set on every write; sync keeps the newest (see services/sync)
  updated_at?: string
  created_at: string
  name: string
}

export type GoalDB = {
  id: string
  // Last change, set on every write; sync keeps the newest (see services/sync)
  updated_at?: string
  title: string
  type: GoalType
  interval: GoalInterval
  amount: number
  created_at: string
  start_at: string
  finish_at: string
  completed_at: string | null
  status: GoalStatus
  author_id: string | null
  genres: string[]
  entries: GoalEntryDB[]
  auto?: boolean
  challenge?: string
  level?: ChallengeLevel
}

export type GoalEntryDB = {
  id: string
  book_id?: BookDB['id']
  pages?: number
  hours?: number
  created_at: string
}
