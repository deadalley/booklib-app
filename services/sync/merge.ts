import type { Database, Deletion } from '~/types/api'
import { recordKey, SYNC_TABLES, tableRecords } from './changes'

/*
 * Merges two copies of the library, record by record: the version changed
 * last wins (`updated_at`, or `created_at` for records saved before change
 * tracking). A deletion wins over any version older than it. Memberships
 * whose book or collection is gone are dropped.
 */

type Stamped = { updated_at?: string; created_at?: string }

const stamp = (record: Stamped) => record.updated_at ?? record.created_at ?? ''

export type MergeSummary = {
  // Records that came from, or changed because of, the other copy
  changed: number
}

export function mergeLibraries(
  local: Database,
  remote: Database,
): { merged: Database; summary: MergeSummary } {
  const deletions = new Map<string, Deletion>()
  for (const deletion of [
    ...(local.deletions ?? []),
    ...(remote.deletions ?? []),
  ]) {
    const key = `${deletion.table}:${deletion.id}`
    const known = deletions.get(key)
    if (!known || deletion.deleted_at > known.deleted_at) {
      deletions.set(key, deletion)
    }
  }

  let changed = 0
  const merged: Database = {
    version: Math.max(local.version ?? 0, remote.version ?? 0) || undefined,
    authors: [],
    books: [],
    collections: [],
    'collection-book': [],
    goals: [],
  }

  for (const table of SYNC_TABLES) {
    const ours = new Map(
      tableRecords(local, table).map((record) => [
        recordKey(table, record),
        record,
      ]),
    )
    const theirs = new Map(
      tableRecords(remote, table).map((record) => [
        recordKey(table, record),
        record,
      ]),
    )
    const records: unknown[] = []

    for (const key of new Set([...ours.keys(), ...theirs.keys()])) {
      const mine = ours.get(key)
      const other = theirs.get(key)
      // Ties keep this device's copy
      const winner =
        mine && other
          ? stamp(other) > stamp(mine)
            ? other
            : mine
          : (mine ?? other)!
      const deletion = deletions.get(`${table}:${key}`)
      const deleted = !!deletion && deletion.deleted_at >= stamp(winner)

      if (deleted) {
        if (mine) changed++
        continue
      }
      // A newer version wins over the deletion; the deletion is void
      if (deletion) deletions.delete(`${table}:${key}`)
      if (winner !== mine) changed++
      records.push(winner)
    }

    ;(merged[table] as unknown[]) = records
  }

  // Memberships of books or collections that are gone
  const bookIds = new Set(merged.books.map(({ id }) => id))
  const collectionIds = new Set(merged.collections.map(({ id }) => id))
  merged['collection-book'] = merged['collection-book'].filter(
    (link) =>
      bookIds.has(link.book_id) && collectionIds.has(link.collection_id),
  )

  merged.deletions = [...deletions.values()]
  return { merged, summary: { changed } }
}
