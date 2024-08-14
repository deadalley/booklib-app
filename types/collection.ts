import type { Book } from './book'

export type Collection = {
  id: number
  name: string
  createdAt: string
  books: Book['id'][]
}
