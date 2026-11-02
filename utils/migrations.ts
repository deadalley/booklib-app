import type { Database } from '~/types/api'
import { WISHLIST_COLLECTION_ID } from './constants'
import { now } from './date'

// Wishlist used to be a property status; it is now a default collection.
// Moves wishlisted books into the collection and marks them as not owned.
// Safe to run repeatedly. Returns whether anything changed.
export function migrateWishlistToCollection(data: Database): boolean {
  let changed = false

  if (!data.collections.some(({ id }) => id === WISHLIST_COLLECTION_ID)) {
    data.collections.push({
      id: WISHLIST_COLLECTION_ID,
      name: 'Wishlist',
      created_at: now(),
    })
    changed = true
  }

  const wishlistRows = data['collection-book'].filter(
    ({ collection_id }) => collection_id === WISHLIST_COLLECTION_ID,
  )

  data.books.forEach((book) => {
    if ((book.property_status as string) !== 'wishlist') return

    if (!wishlistRows.some(({ book_id }) => book_id === book.id)) {
      const row = {
        book_id: book.id,
        collection_id: WISHLIST_COLLECTION_ID,
        order: wishlistRows.length,
      }
      data['collection-book'].push(row)
      wishlistRows.push(row)
    }

    if (!book.collections?.includes(WISHLIST_COLLECTION_ID)) {
      book.collections = [...(book.collections ?? []), WISHLIST_COLLECTION_ID]
    }

    book.property_status = 'not-owned'
    changed = true
  })

  return changed
}

// Ordered list of schema migrations. Each one moves the data to `version`.
// Append new entries here and never change or reorder old ones.
const MIGRATIONS: { version: number; migrate: (data: Database) => void }[] = [
  { version: 1, migrate: migrateWishlistToCollection },
]

export const CURRENT_DB_VERSION = MIGRATIONS.at(-1)!.version

// Brings `data` up to CURRENT_DB_VERSION in place. Files without a version
// predate versioning and run every migration (they are all idempotent).
// Returns whether anything changed, so the caller knows to write.
export function runMigrations(data: Database): boolean {
  const fromVersion = data.version ?? 0

  if (fromVersion > CURRENT_DB_VERSION) {
    throw new Error(
      `The library file was saved by a newer version of BookLib (schema v${fromVersion}, this app supports v${CURRENT_DB_VERSION}). Please update BookLib.`,
    )
  }
  if (fromVersion === CURRENT_DB_VERSION) return false

  MIGRATIONS.filter(({ version }) => version > fromVersion).forEach(
    ({ migrate }) => migrate(data),
  )
  data.version = CURRENT_DB_VERSION
  return true
}
