/**
 * Service tests that use the real transformers (unlike data-management.test.ts,
 * which mocks them), so field mapping and merging are exercised end to end.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LowSync } from 'lowdb'
import type { Database } from '~/types/api'
import type { Book } from '~/types/book'
import type { BookDB, GoalDB } from '~/types/database'
import { BookLibDataManagementService } from './data-management'

vi.mock('lowdb/browser', () => ({
  LocalStoragePreset: vi.fn().mockImplementation(
    (_key: string, defaultData: Database) =>
      ({
        data: structuredClone(defaultData),
        read: vi.fn(),
        write: vi.fn(),
      }) as unknown as LowSync<Database>,
  ),
}))

function dbBook(overrides: Partial<BookDB> = {}): BookDB {
  return {
    id: 'b1',
    title: 'Piranesi',
    author_id: 'a1',
    cover_src: 'cover.jpg',
    created_at: '2024-01-01T00:00:00.000Z',
    started_at: '2024-02-01T00:00:00.000Z',
    finished_at: null,
    current_page: 120,
    genres: ['Fantasy'],
    notes: [{ createdAt: '2024-02-02T00:00:00.000Z', content: 'note' }],
    isbn: '123',
    language: 'en',
    original_language: 'en',
    original_title: 'Piranesi',
    pages: 272,
    progress_status: 'reading',
    property_status: 'owned',
    format: 'ebook',
    publisher: 'Bloomsbury',
    rating: 4,
    summary: 'Halls',
    year: 2020,
    collections: [],
    ...overrides,
  }
}

function goal(overrides: Partial<GoalDB> = {}): GoalDB {
  return {
    id: 'g1',
    title: 'Read',
    interval: 'total',
    amount: 10,
    created_at: '2024-01-01T00:00:00.000Z',
    start_at: '2024-01-01T00:00:00.000Z',
    finish_at: '2024-12-31T23:59:59.999Z',
    status: 'active',
    author_id: 'a1',
    genres: [],
    completed_at: null,
    auto: false,
    type: 'books',
    entries: [
      { id: 'e1', book_id: 'b1', created_at: '2024-03-01T00:00:00.000Z' },
      { id: 'e2', book_id: 'b2', created_at: '2024-03-02T00:00:00.000Z' },
    ],
    ...overrides,
  } as GoalDB
}

describe('BookLibDataManagementService (real transformers)', () => {
  let service: BookLibDataManagementService
  let db: Database

  beforeEach(async () => {
    service = new BookLibDataManagementService()
    await service.initialize()
    db = service['client']!.data
    db.authors.push({
      id: 'a1',
      name: 'Susanna Clarke',
      created_at: '2024-01-01T00:00:00.000Z',
    })
    db.books.push(dbBook(), dbBook({ id: 'b2', title: 'Other' }))
    db['collection-book'].push({ book_id: 'b1', collection_id: 'c1', order: 0 })
    db.collections.push(
      { id: 'c1', name: 'Shelf', created_at: '' },
      { id: 'c2', name: 'Favourites', created_at: '' },
    )
    db.goals.push(goal())
  })

  it('shares one initialisation between concurrent callers', async () => {
    const fresh = new BookLibDataManagementService()
    const doInitialize = vi.spyOn(
      fresh as unknown as { doInitialize: () => Promise<void> },
      'doInitialize',
    )
    await Promise.all([
      fresh.initialize(),
      fresh.initialize(),
      fresh.getBooks({}),
    ])
    expect(doInitialize).toHaveBeenCalledTimes(1)
  })

  describe('updateBook', () => {
    it('only changes the provided fields (bulk add to collection)', async () => {
      const before = await service.getBook('b1')
      const updated = await service.updateBook('b1', {
        collections: ['c1', 'c2'],
      })

      expect(updated).toEqual({ ...before, collections: ['c1', 'c2'] })
      expect(db.books.find((b) => b.id === 'b1')).toMatchObject({
        title: 'Piranesi',
        author_id: 'a1',
        rating: 4,
        current_page: 120,
        notes: [expect.objectContaining({ content: 'note' })],
      })
    })

    it('changes only the author (bulk set author)', async () => {
      db.authors.push({ id: 'a2', name: 'Ted Chiang', created_at: '' })
      const updated = await service.updateBook('b1', { author: 'a2' })
      expect(updated).toMatchObject({
        author: 'a2',
        title: 'Piranesi',
        pages: 272,
        collections: ['c1'],
      })
    })

    it('creates an author from a name, reusing existing names', async () => {
      await service.updateBook('b1', { author: 'susanna clarke' })
      expect(db.authors).toHaveLength(1)
      await service.updateBook('b2', { author: 'New Person' })
      expect(db.authors.map((a) => a.name)).toEqual([
        'Susanna Clarke',
        'New Person',
      ])
    })

    it('keeps the author when the patch has no author key', async () => {
      await service.updateBook('b1', { rating: 5 })
      expect(db.books[0]).toMatchObject({ author_id: 'a1', rating: 5 })
    })

    it('can clear the author explicitly', async () => {
      await service.updateBook('b1', { author: null })
      expect(db.books[0]?.author_id).toBeNull()
    })

    it('persists the current page and merges partial progress', async () => {
      const book = (await service.getBook('b1'))!
      await service.updateBook('b1', {
        progress: { ...book.progress, currentPage: 200 },
      })
      expect((await service.getBook('b1'))?.progress).toMatchObject({
        currentPage: 200,
        status: 'reading',
        startedAt: '2024-02-01T00:00:00.000Z',
      })
    })
  })

  describe('deletes clean up goal references', () => {
    it('deleteBook removes the goal entries of that book', async () => {
      await service.deleteBook('b1')
      expect(db.goals[0]?.entries.map((e) => e.book_id)).toEqual(['b2'])
    })

    it('deleteBooks removes entries of every deleted book', async () => {
      await service.deleteBooks(['b1', 'b2'])
      expect(db.goals[0]?.entries).toEqual([])
    })

    it('deleteAuthor clears the goal author filter', async () => {
      await service.deleteAuthor('a1', { deleteBooks: false })
      expect(db.goals[0]?.author_id).toBeNull()
      expect(db.books.every((b) => b.author_id === null)).toBe(true)
    })

    it('deleteAuthor with books removes their memberships and goal entries', async () => {
      await service.deleteAuthor('a1', { deleteBooks: true })
      expect(db.books).toEqual([])
      expect(db['collection-book']).toEqual([])
      expect(db.goals[0]?.entries).toEqual([])
    })
  })

  describe('importBooks', () => {
    it('adds books in one write and resolves authors by name', async () => {
      const books = [
        { title: 'New', author: 'SUSANNA CLARKE' },
        { title: 'Newer', author: 'Ted Chiang' },
        { title: 'Newest', author: 'ted chiang' },
      ].map(
        (b, i) =>
          ({
            ...b,
            id: `row-${i}`,
            createdAt: '',
            collections: ['c1'],
            progress: {
              status: 'read',
              startedAt: null,
              finishedAt: '2024-05-01T00:00:00.000Z',
              currentPage: null,
              notes: [],
            },
          }) as unknown as Book,
      )
      const write = vi.spyOn(service['client']!, 'write')

      expect(await service.importBooks(books)).toBe(3)
      expect(write).toHaveBeenCalledTimes(1)

      const imported = db.books.slice(2)
      expect(imported.map((b) => b.title)).toEqual(['New', 'Newer', 'Newest'])
      expect(imported.every((b) => !b.id.startsWith('row-'))).toBe(true)
      expect(imported.every((b) => b.collections.length === 0)).toBe(true)
      expect(imported[0]?.author_id).toBe('a1')
      expect(imported[1]?.author_id).toBe(imported[2]?.author_id)
      expect(db.authors.map((a) => a.name)).toEqual([
        'Susanna Clarke',
        'Ted Chiang',
      ])
      expect(imported[0]?.finished_at).toBe('2024-05-01T00:00:00.000Z')
      expect(db['collection-book']).toHaveLength(1)
    })
  })

  describe('importLibrary (restore backup)', () => {
    it('remaps every id and keeps references consistent', async () => {
      const backup: Database = {
        authors: [
          { id: 'x-a1', name: 'Susanna Clarke', created_at: '' },
          { id: 'x-a2', name: 'Ted Chiang', created_at: '' },
        ],
        books: [
          dbBook({
            id: 'x-b1',
            title: 'Stories',
            author_id: 'x-a2',
            collections: ['x-c1'],
          }),
          dbBook({ id: 'x-b2', title: 'Jonathan', author_id: 'x-a1' }),
        ],
        collections: [
          { id: 'x-c1', name: 'Short fiction', created_at: '' },
          { id: 'x-c2', name: 'shelf', created_at: '' },
        ],
        'collection-book': [
          { book_id: 'x-b1', collection_id: 'x-c1', order: 0 },
          { book_id: 'x-b2', collection_id: 'x-c2', order: 0 },
          { book_id: 'missing', collection_id: 'x-c1', order: 1 },
        ],
        goals: [
          goal({
            id: 'x-g1',
            author_id: 'x-a2',
            entries: [
              {
                id: 'x-e1',
                book_id: 'x-b1',
                created_at: '2024-01-01T00:00:00.000Z',
              },
              {
                id: 'x-e2',
                book_id: 'missing',
                created_at: '2024-01-01T00:00:00.000Z',
              },
            ],
          }),
        ],
      }

      await service.importLibrary(backup)

      const ted = db.authors.find((a) => a.name === 'Ted Chiang')!
      const stories = db.books.find((b) => b.title === 'Stories')!
      const jonathan = db.books.find((b) => b.title === 'Jonathan')!
      const shortFiction = db.collections.find(
        (c) => c.name === 'Short fiction',
      )!

      // authors matched by name, new ones created once
      expect(
        db.authors.filter((a) => a.name === 'Susanna Clarke'),
      ).toHaveLength(1)
      expect(jonathan.author_id).toBe('a1')
      expect(stories.author_id).toBe(ted.id)

      // new ids everywhere, no source ids leak through
      const ids = [
        ...db.books.map((b) => b.id),
        ...db.collections.map((c) => c.id),
        ...db.authors.map((a) => a.id),
        ...db.goals.map((g) => g.id),
      ]
      expect(ids.some((id) => id.startsWith('x-'))).toBe(false)

      // memberships remapped; collection matched by name; orphans dropped
      expect(db['collection-book']).toEqual(
        expect.arrayContaining([
          { book_id: stories.id, collection_id: shortFiction.id, order: 0 },
          { book_id: jonathan.id, collection_id: 'c1', order: 0 },
        ]),
      )
      expect(db['collection-book'].some((cb) => cb.book_id === 'missing')).toBe(
        false,
      )
      expect(stories.collections).toEqual([shortFiction.id])

      // goals remapped
      const restoredGoal = db.goals.find((g) => g.author_id === ted.id)!
      expect(restoredGoal.entries.map((e) => e.book_id)).toEqual([stories.id])
    })
  })
})
