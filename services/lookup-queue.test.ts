import { describe, expect, it, vi } from 'vitest'
import type { Book } from '~/types/book'
import {
  LookupOfflineError,
  LookupUnavailableError,
  type BookLookupResult,
} from './book-lookup'
import {
  placeholderTitle,
  processLookupQueue,
  readLookupQueue,
  writeLookupQueue,
  type QueuedLookup,
} from './lookup-queue'

const ISBN = '9780060512750'

const result: BookLookupResult = {
  isbn: ISBN,
  title: 'The Dispossessed',
  author: 'Ursula K. Le Guin',
  publisher: 'Harper',
  year: 1974,
  pages: 387,
  language: 'en',
  summary: null,
  genres: [],
  coverUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
}

const item = (bookId: string): QueuedLookup => ({
  bookId,
  isbn: ISBN,
  placeholderTitle: placeholderTitle(ISBN),
  queuedAt: '2026-11-15T00:00:00.000Z',
})

const book = (id: string, overrides: Partial<Book> = {}) =>
  ({
    id,
    title: placeholderTitle(ISBN),
    isbn: ISBN,
    coverSrc: null,
    ...overrides,
  }) as Book

function deps(overrides = {}) {
  return {
    lookup: vi.fn(async () => result),
    getBook: vi.fn(async (id: string) => book(id)),
    updateBook: vi.fn(async () => null),
    getAuthors: vi.fn(async () => []),
    downloadCover: vi.fn(async () => 'booklib-cover://x.jpg'),
    ...overrides,
  }
}

describe('processLookupQueue', () => {
  it('replaces the placeholder title and fills empty fields', async () => {
    const d = deps()
    const { filled, remaining } = await processLookupQueue([item('b1')], d)
    expect(filled).toEqual(['The Dispossessed'])
    expect(remaining).toEqual([])
    expect(d.updateBook).toHaveBeenCalledWith(
      'b1',
      expect.objectContaining({
        title: 'The Dispossessed',
        author: 'Ursula K. Le Guin',
        pages: 387,
      }),
    )
    expect(d.downloadCover).toHaveBeenCalledWith('b1', result.coverUrl)
  })

  it('keeps a title the user typed', async () => {
    const d = deps({
      getBook: vi.fn(async (id: string) => book(id, { title: 'Mine' })),
    })
    await processLookupQueue([item('b1')], d)
    expect(d.updateBook.mock.calls[0]).not.toHaveProperty('1.title')
  })

  it('keeps everything queued while still offline', async () => {
    const d = deps({
      lookup: vi.fn(async () => {
        throw new LookupOfflineError()
      }),
    })
    const items = [item('b1'), item('b2')]
    const { remaining } = await processLookupQueue(items, d)
    expect(remaining).toEqual(items)
    expect(d.lookup).toHaveBeenCalledTimes(1)
    expect(d.updateBook).not.toHaveBeenCalled()
  })

  it('keeps everything queued while the services are down', async () => {
    const d = deps({
      lookup: vi.fn(async () => {
        throw new LookupUnavailableError('busy')
      }),
    })
    const items = [item('b1'), item('b2')]
    expect((await processLookupQueue(items, d)).remaining).toEqual(items)
  })

  it('drops deleted books and unknown ISBNs', async () => {
    const d = deps({
      getBook: vi.fn(async (id: string) => (id === 'gone' ? null : book(id))),
      lookup: vi.fn(async () => null),
    })
    const { filled, remaining } = await processLookupQueue(
      [item('gone'), item('b1')],
      d,
    )
    expect(filled).toEqual([])
    expect(remaining).toEqual([])
  })
})

describe('lookup queue storage', () => {
  it('round-trips and clears', () => {
    writeLookupQueue([item('b1')])
    expect(readLookupQueue()).toEqual([item('b1')])
    writeLookupQueue([])
    expect(readLookupQueue()).toEqual([])
  })
})
