import { describe, expect, it } from 'vitest'
import type { Database } from '~/types/api'
import { snapshotOf, stampChanges } from './changes'

const T0 = '2026-01-01T00:00:00.000Z'
const T1 = '2026-02-01T00:00:00.000Z'

function db(): Database {
  return {
    authors: [{ id: 'a1', name: 'Ursula', created_at: T0 }],
    books: [],
    collections: [{ id: 'c1', name: 'Shelf', created_at: T0 }],
    'collection-book': [{ book_id: 'b1', collection_id: 'c1', order: 0 }],
    goals: [],
  }
}

describe('stampChanges', () => {
  it('stamps only changed records', () => {
    const data = db()
    const before = snapshotOf(data)
    data.authors[0]!.name = 'Ursula K. Le Guin'
    expect(stampChanges(before, data, T1)).toBe(true)
    expect(data.authors[0]!.updated_at).toBe(T1)
    expect(data.collections[0]!.updated_at).toBeUndefined()
  })

  it('ignores updated_at itself and reports no change', () => {
    const data = db()
    data.authors[0]!.updated_at = T0
    const before = snapshotOf(data)
    expect(stampChanges(before, data, T1)).toBe(false)
    expect(data.authors[0]!.updated_at).toBe(T0)
  })

  it('records deletions, including collection memberships', () => {
    const data = db()
    const before = snapshotOf(data)
    data.authors = []
    data['collection-book'] = []
    stampChanges(before, data, T1)
    expect(data.deletions).toEqual([
      { table: 'authors', id: 'a1', deleted_at: T1 },
      { table: 'collection-book', id: 'c1|b1', deleted_at: T1 },
    ])
  })

  it('drops the deletion when a record comes back', () => {
    const data = db()
    data.deletions = [{ table: 'authors', id: 'a2', deleted_at: T0 }]
    const before = snapshotOf(data)
    data.authors.push({ id: 'a2', name: 'Back', created_at: T0 })
    stampChanges(before, data, T1)
    expect(data.deletions).toEqual([])
    expect(data.authors[1]!.updated_at).toBe(T1)
  })

  it('stamps a changed membership order', () => {
    const data = db()
    const before = snapshotOf(data)
    data['collection-book'][0]!.order = 3
    stampChanges(before, data, T1)
    expect(data['collection-book'][0]!.updated_at).toBe(T1)
  })
})
