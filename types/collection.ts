import type { Book } from './book'

export type Collection<ID extends number | string = number> = {
  id: ID
  name: string
  createdAt: string
  books: { id: Book<ID>['id']; order: number }[]
}
