export type View = 'cards' | 'table' | 'expanded-cards'

/** A change applied to every selected book from the bulk actions bar */
export type BulkBookChange =
  | { field: 'collection'; collectionId: string; mode: 'add' | 'remove' }
  | { field: 'status'; status: import('./book').BookProgressStatus | null }
  // An author id, or a name for a new author
  | { field: 'author'; author: string }
  | { field: 'genre'; genre: string; mode: 'add' | 'remove' }
  | { field: 'format'; format: import('./book').BookFormat }
  | { field: 'rating'; rating: number | null }
