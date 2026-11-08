import { describe, expect, it } from 'vitest'
import type { Book, BookNote } from '~/types/book'
import type { Goal } from '~/types/goal'
import {
  formatYearDelta,
  getDayLevel,
  getLongestStreak,
  getReadingDays,
  getReviewYears,
  getYearGoals,
  getYearReview,
  getYearTotals,
} from './year-review'

const TODAY = '2026-11-08'

function book(
  id: string,
  progress: Partial<Book['progress']> = {},
  overrides: Partial<Book> = {},
): Book {
  return {
    id,
    title: `Book ${id}`,
    coverSrc: null,
    createdAt: '2024-01-01T00:00:00.000Z',
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
    author: 'a1',
    propertyStatus: null,
    ...overrides,
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

const read = (id: string, finishedAt: string, overrides: Partial<Book> = {}) =>
  book(
    id,
    { status: 'read', finishedAt: `${finishedAt}T00:00:00.000Z` },
    overrides,
  )

const log = (date: string, page?: number, content = ''): BookNote => ({
  createdAt: `${date}T00:00:00.000Z`,
  page,
  content,
})

const authorName = (id: string | null) => (id ? `Author ${id}` : 'Unknown')

describe('reading days and pages', () => {
  const reading = book('r', {
    status: 'reading',
    notes: [
      log('2025-12-30', 50),
      log('2026-01-02', 80),
      log('2026-01-03', 120),
    ],
  })

  it('counts pages as the increase over the previous log', () => {
    expect(getYearTotals([reading], 2026).pages).toBe(70)
    expect(getYearTotals([reading], 2025).pages).toBe(50)
  })

  it('counts days with logged pages or a finished book', () => {
    const finished = read('f', '2026-01-05')
    const days = getReadingDays([reading, finished], 2026)
    expect([...days.keys()].sort()).toEqual([
      '2026-01-02',
      '2026-01-03',
      '2026-01-05',
    ])
    expect(days.get('2026-01-05')).toBe(0)
  })

  it('ignores notes without a page and logs that go backwards', () => {
    const reread = book('x', {
      notes: [log('2026-02-01', 100), log('2026-02-02', 20), log('2026-02-03')],
    })
    expect([...getReadingDays([reread], 2026).keys()]).toEqual(['2026-02-01'])
  })

  it('finds the longest run of consecutive days', () => {
    expect(
      getLongestStreak([
        '2026-01-01',
        '2026-01-02',
        '2026-01-03',
        '2026-01-05',
        '2026-12-31',
      ]),
    ).toBe(3)
    expect(getLongestStreak([])).toBe(0)
  })

  it('grades days relative to the busiest one', () => {
    expect(getDayLevel(0, 90)).toBe(1)
    expect(getDayLevel(20, 90)).toBe(1)
    expect(getDayLevel(50, 90)).toBe(2)
    expect(getDayLevel(90, 90)).toBe(3)
  })
})

describe('getReviewYears', () => {
  it('lists years with activity and the current year, newest first', () => {
    const books = [
      read('a', '2024-05-01'),
      book('b', { notes: [log('2023-03-01', 10)] }),
    ]
    expect(getReviewYears(books, TODAY)).toEqual([2026, 2024, 2023])
  })
})

describe('getYearGoals', () => {
  const goal = (overrides: Partial<Goal>): Goal =>
    ({
      id: 'g',
      title: 'Goal',
      type: 'books',
      interval: 'total',
      amount: 2,
      createdAt: '2026-01-01',
      startAt: '2026-01-01T00:00:00.000Z',
      finishAt: '2026-12-31T23:59:59.999Z',
      completedAt: null,
      status: 'tracking',
      author: null,
      genres: [],
      entries: [],
      ...overrides,
    }) as Goal

  it('keeps goals overlapping the year, completed ones first', () => {
    const done = goal({
      id: 'done',
      entries: [
        { id: '1', book: 'a', createdAt: '2026-03-01' },
        { id: '2', book: 'b', createdAt: '2026-04-02' },
      ],
    })
    const running = goal({ id: 'running' })
    const old = goal({
      id: 'old',
      startAt: '2025-01-01T00:00:00.000Z',
      finishAt: '2025-12-31T23:59:59.999Z',
    })
    const rows = getYearGoals([running, old, done], [], 2026, TODAY)
    expect(rows.map(({ goal }) => goal.id)).toEqual(['done', 'running'])
    expect(rows[0]).toMatchObject({
      status: 'completed',
      pct: 100,
      completedOn: '2026-04-02',
    })
    expect(rows[1]?.detail).toBe('0 of 2 books')
  })
})

describe('getYearReview', () => {
  const books = [
    read('a', '2026-01-06', { rating: 4, pages: 304, genres: ['Sci-fi'] }),
    read('b', '2026-03-10', {
      rating: 5,
      pages: 247,
      author: 'a2',
      genres: ['Fiction'],
    }),
    read('c', '2026-03-20', {
      rating: 5,
      pages: 500,
      author: 'a2',
      genres: ['Fiction'],
    }),
    read('old', '2025-06-01', { author: 'a1', genres: ['Sci-fi'] }),
    book('dnf', {
      status: 'not-finished',
      finishedAt: '2026-05-01T00:00:00.000Z',
      startedAt: '2026-04-01T00:00:00.000Z',
    }),
    book('now', {
      status: 'reading',
      startedAt: '2026-10-01T00:00:00.000Z',
      notes: [log('2026-10-02', 40, 'A great opening'), log('2026-10-03', 90)],
    }),
  ]
  const review = getYearReview(2026, books, [], authorName, TODAY)

  it('ranks the top books by rating, ties by length', () => {
    expect(review.top.map(({ id }) => id)).toEqual(['c', 'b', 'a'])
    expect(review.rankedByRating).toBe(true)
    expect(review.first?.id).toBe('a')
    expect(review.last?.id).toBe('c')
  })

  it('finds new and recurring authors, new and top genres', () => {
    expect(review.newAuthors).toEqual(['Author a2'])
    expect(review.recurringAuthors).toEqual([{ label: 'Author a2', value: 2 }])
    expect(review.newGenres).toEqual(['Fiction'])
    expect(review.topGenres[0]).toEqual({ label: 'Fiction', value: 2 })
  })

  it('splits books into started, finished, not finished and still reading', () => {
    expect(review.finished).toHaveLength(3)
    expect(review.didNotFinish.map(({ id }) => id)).toEqual(['dnf'])
    expect(review.stillReading.map(({ id }) => id)).toEqual(['now'])
    expect(review.started.map(({ id }) => id)).toEqual(['dnf', 'now'])
  })

  it('collects notes and highlights', () => {
    expect(review.notes).toHaveLength(1)
    expect(review.mostNoted?.count).toBe(1)
    expect(review.totals).toMatchObject({ books: 3, pages: 90 })
    expect(review.insights[0]).toMatchObject({
      big: '+2',
      headline: 'You read 2 more books',
    })
    expect(review.insights.map(({ headline }) => headline)).toContain(
      'March was your busiest month',
    )
  })

  it('is partial without page logs and empty without any activity', () => {
    const partial = getYearReview(2025, books, [], authorName, TODAY)
    expect(partial.hasActivity).toBe(true)
    expect(partial.hasLogs).toBe(false)
    const empty = getYearReview(2023, books, [], authorName, TODAY)
    expect(empty.hasActivity).toBe(false)
    expect(empty.insights).toEqual([])
  })
})

describe('formatYearDelta', () => {
  it('describes the change from the previous year', () => {
    expect(formatYearDelta(18, 13, 2025)).toEqual({
      label: 'vs 2025: +5',
      direction: 'up',
    })
    expect(formatYearDelta(10, 13, 2025).label).toBe('vs 2025: −3')
    expect(formatYearDelta(4, 4, 2025).label).toBe('same as 2025')
  })
})
