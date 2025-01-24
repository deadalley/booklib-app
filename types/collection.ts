import type { Book } from './book'

export type Collection = {
  id: number
  name: string
  createdAt: string
  books: { id: Book['id']; order: number }[]
}
