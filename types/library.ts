import type { BookDB, CollectionDB } from './database'

export type LibraryData = { collections: CollectionDB[]; books: BookDB[] }
