import { describe, expect, it } from 'vitest'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'
import {
  activeDismissals,
  buildSuggestions,
  formatRelativeDay,
  getBookPercentage,
  getGreeting,
  snoozeUntil,
} from './suggestions'

const TODAY = '2026-11-02'

const authors: Author[] = [
  { id: 'a1', name: 'Ursula K. Le Guin', createdAt: '2020-01-01' },
  { id: 'a2', name: 'Ted Chiang', createdAt: '2020-01-01' },
]

function book(id: string, overrides: Partial<Book> = {}): Book {
  const { progress, ...rest } = overrides
  return {
    id,
    title: `Book ${id}`,
    coverSrc: null,
    createdAt: '2026-06-01T12:00:00.000Z',
    isbn: null,
    language: null,
    originalTitle: null,
    originalLanguage: null,
    pages: 200,
    publisher: null,
    rating: null,
    summary: null,
    year: null,
    genres: ['Fantasy'],
    collections: [],
    format: null,
    author: 'a1',
    propertyStatus: null,
    ...rest,
    progress: {
      status: null,
      startedAt: null,
      finishedAt: null,
      notes: [],
      currentPage: null,
      ...progress,
    },
  }
}

const reading = (id: string, currentPage: number, extra: Partial<Book> = {}) =>
  book(id, {
    ...extra,
    progress: {
      status: 'reading',
      currentPage,
      startedAt: null,
      finishedAt: null,
      notes: [],
    },
  })

const read = (id: string, extra: Partial<Book> = {}, finishedAt = '2026-10-30') =>
  book(id, {
    ...extra,
    progress: {
      status: 'read',
      finishedAt,
      startedAt: null,
      notes: [],
      currentPage: null,
    },
  })

function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'g1',
    title: 'Read 24 books',
    type: 'books',
    interval: 'total',
    amount: 24,
    createdAt: '2026-01-01T00:00:00.000Z',
    startAt: '2026-01-01T00:00:00.000Z',
    finishAt: '2026-12-31T00:00:00.000Z',
    completedAt: null,
    status: 'tracking',
    author: null,
    genres: [],
    entries: [],
    ...overrides,
  } as Goal
}

const build = (books: Book[], goals: Goal[] = []) =>
  buildSuggestions({ books, authors, goals, today: TODAY })

describe('formatRelativeDay', () => {
  it.each([
    ['2026-11-02', 'today'],
    ['2026-11-01', 'yesterday'],
    ['2026-10-30', '3 days ago'],
    ['2026-10-03', '1 month ago'],
    ['2026-07-02', '4 months ago'],
    ['2025-11-02', '1 year ago'],
    ['2023-10-01', '3 years ago'],
  ])('%s → %s', (from, expected) => {
    expect(formatRelativeDay(from, TODAY)).toBe(expected)
  })

  it('drops the suffix on request', () => {
    expect(formatRelativeDay('2026-07-02', TODAY, { suffix: false })).toBe(
      '4 months',
    )
  })
})

describe('getGreeting', () => {
  it('follows the time of day', () => {
    expect(getGreeting(8)).toBe('Good morning')
    expect(getGreeting(12)).toBe('Good afternoon')
    expect(getGreeting(17)).toBe('Good afternoon')
    expect(getGreeting(18)).toBe('Good evening')
  })
})

describe('getBookPercentage', () => {
  it('uses the current page, and every page once read', () => {
    expect(getBookPercentage(reading('b1', 50))).toBe(25)
    expect(getBookPercentage(read('b1'))).toBe(100)
    expect(getBookPercentage(book('b1', { pages: null }))).toBe(0)
  })
})

describe('buildSuggestions', () => {
  it('returns nothing for an empty library', () => {
    expect(build([])).toEqual([])
  })

  it('suggests the two books closest to the end between 60% and 99%', () => {
    const result = build([
      reading('b1', 130), // 65%
      reading('b2', 190), // 95%
      reading('b3', 160), // 80%
      reading('b4', 100), // 50%: too early
      reading('b5', 200), // 100%: done
      reading('b6', 150, { pages: null }),
    ]).filter(({ kind }) => kind === 'almost')

    expect(result.map(({ book }) => book.id)).toEqual(['b2', 'b3'])
    expect(result[0]).toMatchObject({
      id: 'almost-b2',
      title: 'You’re almost finishing Book b2!',
      body: '10 pages left. You’re 95% of the way through.',
      cta: 'Continue reading',
      progress: 95,
      action: { type: 'open', bookId: 'b2' },
    })
  })

  it('suggests logging a finished book once per manual book goal', () => {
    const books = [read('b1'), read('b2'), read('b3', {}, '2025-05-01')]
    const goals = [
      goal({ id: 'g1', title: 'Read 24 books' }),
      goal({ id: 'g2', auto: true }),
      goal({ id: 'g3', status: 'not-tracking' }),
      goal({ id: 'g4', type: 'pages', entries: [] } as Partial<Goal>),
      goal({
        id: 'g5',
        title: 'Logged',
        entries: [
          { id: 'e1', book: 'b1', createdAt: '2026-10-30' },
          { id: 'e2', book: 'b2', createdAt: '2026-10-30' },
        ],
      } as Partial<Goal>),
    ]

    const result = build(books, goals).filter(({ kind }) => kind === 'log')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      id: 'log-g1-b1',
      title: 'Log Book b1 for your goal “Read 24 books”',
      body: 'You finished it 3 days ago, but it isn’t counted yet.',
      cta: 'Log book',
      action: { type: 'log', goalId: 'g1', bookId: 'b1' },
    })
  })

  it('skips finished goals when suggesting logs', () => {
    const goals = [goal({ finishAt: '2026-10-31T00:00:00.000Z' })]
    expect(build([read('b1')], goals).some(({ kind }) => kind === 'log')).toBe(
      false,
    )
  })

  it('suggests an unread book from the best-rated author', () => {
    const books = [
      read('b1', { author: 'a1', rating: 3 }),
      book('b2', { author: 'a1' }),
      read('b3', { author: 'a2', rating: 5 }),
      read('b4', { author: 'a2', rating: 4 }),
      book('b5', { author: 'a2', createdAt: '2026-08-01T00:00:00.000Z' }),
      book('b6', { author: 'a2', createdAt: '2026-07-01T00:00:00.000Z' }),
    ]

    const result = build(books).filter(({ kind }) => kind === 'author')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      title: 'How about a book from Ted Chiang?',
      body: 'You rated their books 4.5 ★ on average. Book b6 is waiting on your shelf.',
      cta: 'Open book',
      action: { type: 'open', bookId: 'b6' },
    })
  })

  it('needs a rated read book and an unread book for an author suggestion', () => {
    const books = [
      read('b1', { author: 'a1' }),
      book('b2', { author: 'a1' }),
      read('b3', { author: 'a2', rating: 5 }),
    ]
    expect(build(books).some(({ kind }) => kind === 'author')).toBe(false)
  })

  it('suggests the two books waiting longest on the shelf', () => {
    const books = [
      book('b1', { createdAt: '2026-07-02T10:00:00.000Z' }),
      book('b2', {
        createdAt: '2024-01-01T10:00:00.000Z',
        title: 'Earthsea',
        pages: 183,
      }),
      book('b3', {
        createdAt: '2025-01-01T10:00:00.000Z',
        author: null,
        pages: null,
        genres: [],
      }),
      reading('b4', 10, { createdAt: '2020-01-01T10:00:00.000Z' }),
    ]

    const result = build(books).filter(({ kind }) => kind === 'old')
    expect(result.map(({ book }) => book.id)).toEqual(['b2', 'b3'])
    expect(result[0]).toMatchObject({
      id: 'old-b2',
      title:
        'Earthsea has been in your library for 3 years. How about giving it a try?',
      body: 'Ursula K. Le Guin · 183 pages · Fantasy',
      cta: 'Start reading',
      action: { type: 'start', bookId: 'b2' },
    })
    expect(result[1]!.body).toBe('')
  })

  it('orders the kinds: almost, log, author, old', () => {
    const books = [
      book('b1', { author: 'a1', createdAt: '2025-01-01T00:00:00.000Z' }),
      read('b2', { author: 'a1', rating: 4 }),
      reading('b3', 180, { author: 'a2' }),
    ]
    expect(build(books, [goal()]).map(({ kind }) => kind)).toEqual([
      'almost',
      'log',
      'author',
      'old',
    ])
  })

  it('gives every suggestion a unique id', () => {
    const books = [
      book('b1', { author: 'a1' }),
      read('b2', { author: 'a1', rating: 4 }),
      reading('b3', 180),
    ]
    const ids = build(books, [goal(), goal({ id: 'g2' })]).map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('dismissals', () => {
  it('keeps a dismissal for 14 days', () => {
    const now = Date.UTC(2026, 10, 2)
    const dismissed = { a: snoozeUntil(now), b: now - 1 }
    expect(Object.keys(activeDismissals(dismissed, now))).toEqual(['a'])
    expect(
      activeDismissals(dismissed, now + 14 * 24 * 60 * 60 * 1000),
    ).toEqual({})
  })
})
