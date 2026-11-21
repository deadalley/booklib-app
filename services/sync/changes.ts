import type { Database, Deletion, SyncTable } from '~/types/api'

/*
 * Change tracking for sync. Every write compares the library with how it
 * was last read or written: changed records get `updated_at`, removed ones
 * a deletion marker. Sync then keeps the newest version of each record and
 * doesn't bring deleted ones back. Doing this on write means no save path
 * has to remember to do it.
 */

export const SYNC_TABLES: SyncTable[] = [
  'authors',
  'books',
  'collections',
  'goals',
  'collection-book',
]

type TrackedRecord = { updated_at?: string } & Record<string, unknown>

/** What identifies a record within its table */
export function recordKey(table: SyncTable, record: TrackedRecord): string {
  return table === 'collection-book'
    ? `${record.collection_id}|${record.book_id}`
    : String(record.id)
}

export function tableRecords(db: Database, table: SyncTable): TrackedRecord[] {
  return (db[table] ?? []) as unknown as TrackedRecord[]
}

/** A record's content, ignoring when it was changed */
function fingerprint(record: TrackedRecord): string {
  const { updated_at: _, ...rest } = record
  return JSON.stringify(rest)
}

export type Snapshot = Record<SyncTable, Map<string, string>>

export function snapshotOf(db: Database): Snapshot {
  return Object.fromEntries(
    SYNC_TABLES.map((table) => [
      table,
      new Map(
        tableRecords(db, table).map((record) => [
          recordKey(table, record),
          fingerprint(record),
        ]),
      ),
    ]),
  ) as Snapshot
}

/**
 * Stamps `updated_at` on records that changed since `previous` and records a
 * deletion for each one that's gone. A record added back loses its deletion
 * marker. Returns whether anything changed.
 */
export function stampChanges(
  previous: Snapshot,
  db: Database,
  now: string,
): boolean {
  let changed = false
  const deletions = new Map<string, Deletion>(
    (db.deletions ?? []).map((deletion) => [
      `${deletion.table}:${deletion.id}`,
      deletion,
    ]),
  )

  for (const table of SYNC_TABLES) {
    const before = previous[table]
    const present = new Set<string>()

    for (const record of tableRecords(db, table)) {
      const key = recordKey(table, record)
      present.add(key)
      if (before.get(key) !== fingerprint(record)) {
        record.updated_at = now
        changed = true
      }
      if (deletions.delete(`${table}:${key}`)) changed = true
    }

    for (const key of before.keys()) {
      if (present.has(key)) continue
      deletions.set(`${table}:${key}`, { table, id: key, deleted_at: now })
      changed = true
    }
  }

  db.deletions = [...deletions.values()]
  return changed
}
