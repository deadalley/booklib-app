import { describe, expect, it } from 'vitest'
import type { Book } from '~/types/book'
import {
  filterNextReads,
  pickNextRead,
  weighNextRead,
  type NextReadContext,
} from './next-read'

const TODAY = '2026-11-15'

function book(id: string, overrides: Partial<Book> = {}): Book {
  return {
    id,
    title: id,
    coverSrc: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    isbn: null,
    language: null,
    originalTitle: null,
    originalLanguage: null,
    pages: 300,
    publisher: null,
    rating: null,
    summary: null,
    year: null,
    genres: [],
    collections: [],
    format: null,
    author: null,
    progress: {
      startedAt: null,
      finishedAt: null,
      status: null,
      notes: [],
      currentPage: null,
    },
    propertyStatus: null,
    ...overrides,
  }
}

const context = (
  overrides: Partial<NextReadContext> = {},
): NextReadContext => ({
  tbrIds: [],
  library: [],
  today: TODAY,
  ...overrides,
})

describe('filterNextReads', () => {
  const books = [
    book('short', { pages: 180, genres: ['Fantasy'], format: 'ebook' }),
    book('long', { pages: 600, author: 'a1' }),
    book('unknown-length', { pages: null }),
    book('reading', {
      progress: { ...book('x').progress, status: 'reading' },
    }),
  ]

  it('keeps only unstarted books', () => {
    expect(filterNextReads(books, {}).map(({ id }) => id)).toEqual([
      'short',
      'long',
      'unknown-length',
    ])
  })

  it('filters by genre, format, author and length', () => {
    const ids = (filters: Parameters<typeof filterNextReads>[1]) =>
      filterNextReads(books, filters).map(({ id }) => id)
    expect(ids({ genre: 'Fantasy' })).toEqual(['short'])
    expect(ids({ format: 'ebook' })).toEqual(['short'])
    expect(ids({ authorId: 'a1' })).toEqual(['long'])
    expect(ids({ length: 'short' })).toEqual(['short'])
    expect(ids({ length: 'long' })).toEqual(['long'])
  })
})

describe('weighNextRead', () => {
  it('favours the top of the To Be Read queue and says so', () => {
    const ctx = context({ tbrIds: ['a', 'b', 'c'] })
    const first = weighNextRead(book('a'), ctx)
    const last = weighNextRead(book('c'), ctx)
    expect(first.weight).toBeGreaterThan(last.weight)
    expect(first.reasons).toEqual(['Top of your To Be Read'])
    expect(last.reasons).toEqual(['#3 on your To Be Read'])
  })

  it('favours highly rated authors and books waiting a long time', () => {
    const library = [book('read', { author: 'a1', rating: 5 })]
    const pick = weighNextRead(
      book('old', { author: 'a1', createdAt: '2024-11-01T00:00:00.000Z' }),
      context({ library }),
    )
    expect(pick.weight).toBeGreaterThan(1)
    expect(pick.reasons).toEqual([
      'By an author you rate 5.0 ★',
      'On your shelf for 2 years',
    ])
  })
})

describe('pickNextRead', () => {
  const books = [book('a'), book('b'), book('c')]

  it('picks at random', () => {
    const pick = pickNextRead(books, context(), {
      mode: 'random',
      random: () => 0.5,
    })
    expect(pick?.book.id).toBe('b')
  })

  it('weights the pick', () => {
    // a is #1 of 3 (weight 4), b and c 2.75 and 1.5: 0.4 lands in a's share
    const ctx = context({ tbrIds: ['a', 'b', 'c'] })
    expect(pickNextRead(books, ctx, { random: () => 0.4 })?.book.id).toBe('a')
    expect(pickNextRead(books, ctx, { random: () => 0.99 })?.book.id).toBe('c')
  })

  it('skips earlier picks until all were offered', () => {
    const pick = pickNextRead(books, context(), {
      mode: 'random',
      exclude: ['a', 'b'],
      random: () => 0,
    })
    expect(pick?.book.id).toBe('c')
    expect(
      pickNextRead(books, context(), {
        exclude: ['a', 'b', 'c'],
        random: () => 0,
      })?.book.id,
    ).toBe('a')
    expect(pickNextRead([], context())).toBeNull()
  })
})
