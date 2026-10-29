import { describe, expect, it } from 'vitest'
import type { Database } from '~/types/api'
import type { BookDB } from '~/types/database'
import { migrateWishlistToCollection } from './migrations'

function createDatabase(): Database {
  return {
    authors: [],
    books: [
      {
        id: '1',
        title: 'Wished',
        property_status: 'wishlist',
        collections: ['favorite'],
      } as unknown as BookDB,
      { id: '2', title: 'Owned', property_status: 'owned' } as BookDB,
    ],
    collections: [{ id: 'favorite', name: 'Favorites', created_at: '' }],
    'collection-book': [{ book_id: '1', collection_id: 'favorite', order: 0 }],
    goals: [],
  }
}

describe('migrateWishlistToCollection', () => {
  it('moves wishlisted books into the wishlist collection', () => {
    const data = createDatabase()

    expect(migrateWishlistToCollection(data)).toBe(true)

    expect(data.collections.map(({ id }) => id)).toEqual([
      'favorite',
      'wishlist',
    ])
    expect(data['collection-book']).toEqual([
      { book_id: '1', collection_id: 'favorite', order: 0 },
      { book_id: '1', collection_id: 'wishlist', order: 0 },
    ])
    expect(data.books[0]?.property_status).toBe('not-owned')
    expect(data.books[0]?.collections).toEqual(['favorite', 'wishlist'])
    expect(data.books[1]?.property_status).toBe('owned')
  })

  it('is safe to run twice', () => {
    const data = createDatabase()

    migrateWishlistToCollection(data)
    const snapshot = JSON.stringify(data)

    expect(migrateWishlistToCollection(data)).toBe(false)
    expect(JSON.stringify(data)).toBe(snapshot)
  })
})
