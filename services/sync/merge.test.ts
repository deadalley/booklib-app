import { describe, expect, it } from 'vitest'
import type { Database } from '~/types/api'
import type { BookDB } from '~/types/database'
import { mergeLibraries } from './merge'

const T = (day: number) =>
  `2026-11-${String(day).padStart(2, '0')}T00:00:00.000Z`

function book(id: string, title: string, updated: number): BookDB {
  return {
    id,
    title,
    created_at: T(1),
    updated_at: T(updated),
  } as BookDB
}

function library(data: Partial<Database> = {}): Database {
  return {
    authors: [],
    books: [],
    collections: [],
    'collection-book': [],
    goals: [],
    ...data,
  }
}

describe('mergeLibraries', () => {
  it('keeps the newest version of each record', () => {
    const local = library({
      books: [book('b1', 'Local newer', 5), book('b2', 'Local older', 2)],
    })
    const remote = library({
      books: [book('b1', 'Remote older', 3), book('b2', 'Remote newer', 4)],
    })
    const { merged, summary } = mergeLibraries(local, remote)
    expect(merged.books.map(({ title }) => title)).toEqual([
      'Local newer',
      'Remote newer',
    ])
    expect(summary.changed).toBe(1)
  })

  it('adds records from either side', () => {
    const { merged } = mergeLibraries(
      library({ books: [book('b1', 'Only here', 2)] }),
      library({ books: [book('b2', 'Only there', 2)] }),
    )
    expect(merged.books.map(({ id }) => id)).toEqual(['b1', 'b2'])
  })

  it('applies a deletion newer than the record', () => {
    const { merged, summary } = mergeLibraries(
      library({ books: [book('b1', 'Deleted elsewhere', 2)] }),
      library({
        deletions: [{ table: 'books', id: 'b1', deleted_at: T(3) }],
      }),
    )
    expect(merged.books).toEqual([])
    expect(merged.deletions).toHaveLength(1)
    expect(summary.changed).toBe(1)
  })

  it('keeps a record edited after it was deleted elsewhere', () => {
    const { merged } = mergeLibraries(
      library({ books: [book('b1', 'Edited later', 4)] }),
      library({
        deletions: [{ table: 'books', id: 'b1', deleted_at: T(3) }],
      }),
    )
    expect(merged.books).toHaveLength(1)
    expect(merged.deletions).toEqual([])
  })

  it('uses created_at for records saved before change tracking', () => {
    const old = { id: 'a1', name: 'Untracked', created_at: T(1) }
    const { merged } = mergeLibraries(
      library({ authors: [old] }),
      library({
        authors: [
          { id: 'a1', name: 'Renamed', created_at: T(1), updated_at: T(2) },
        ],
      }),
    )
    expect(merged.authors[0]!.name).toBe('Renamed')
  })

  it('drops memberships of books or collections that are gone', () => {
    const { merged } = mergeLibraries(
      library({
        books: [book('b1', 'Kept', 2)],
        collections: [{ id: 'c1', name: 'Shelf', created_at: T(1) }],
        'collection-book': [
          { book_id: 'b1', collection_id: 'c1', order: 0 },
          { book_id: 'gone', collection_id: 'c1', order: 1 },
        ],
      }),
      library(),
    )
    expect(merged['collection-book']).toEqual([
      { book_id: 'b1', collection_id: 'c1', order: 0 },
    ])
  })

  it('merges membership order changes', () => {
    const local = library({
      books: [book('b1', 'A', 1)],
      collections: [{ id: 'tbr', name: 'TBR', created_at: T(1) }],
      'collection-book': [
        { book_id: 'b1', collection_id: 'tbr', order: 0, updated_at: T(1) },
      ],
    })
    const remote = structuredClone(local)
    remote['collection-book'][0]!.order = 5
    remote['collection-book'][0]!.updated_at = T(2)
    expect(
      mergeLibraries(local, remote).merged['collection-book'][0]!.order,
    ).toBe(5)
  })
})
