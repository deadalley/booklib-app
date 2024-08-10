import type { Book } from './book'

export type Collection = {
  id: number
  name: string
  description?: string
  createdAt: string
  books: Pick<Book, 'id'>[]
}
