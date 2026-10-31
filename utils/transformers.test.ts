import { describe, expect, it } from 'vitest'
import type { Book } from '~/types/book'
import type { Goal } from '~/types/goal'
import {
  bookToDbBook,
  dbBookToBook,
  dbGoalToGoal,
  goalToDbGoal,
} from './transformers'

function pagesGoal(createdAt: string): Goal {
  return {
    id: 'g1',
    title: '30 pages a day',
    type: 'pages',
    interval: 'daily',
    amount: 30,
    createdAt: '2026-01-01T00:00:00.000Z',
    startAt: '2026-10-01T00:00:00.000Z',
    finishAt: '2026-10-31T23:59:59.999Z',
    completedAt: null,
    status: 'tracking',
    author: null,
    genres: [],
    entries: [{ id: 'e1', pages: 30, createdAt }],
  } as Goal
}

describe('goal transformers', () => {
  it('stores calendar days from forms at UTC midnight', () => {
    const db = goalToDbGoal(pagesGoal('2026-10-30'))
    expect(db.entries[0]?.created_at).toBe('2026-10-30T00:00:00.000Z')
  })

  it('does not shift entry dates when a loaded goal is saved repeatedly', () => {
    let goal = dbGoalToGoal(goalToDbGoal(pagesGoal('2026-10-30')))
    for (let i = 0; i < 5; i++) {
      goal = dbGoalToGoal(goalToDbGoal(goal))
    }
    expect(goal.entries[0]?.createdAt).toBe('2026-10-30T00:00:00.000Z')
  })
})

describe('book transformers', () => {
  it('round-trips progress including the current page', () => {
    const book = {
      id: 'b1',
      title: 'Dune',
      author: 'a1',
      coverSrc: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      isbn: null,
      language: 'en',
      originalTitle: null,
      originalLanguage: null,
      pages: 412,
      publisher: null,
      rating: 4,
      summary: null,
      year: 1965,
      genres: ['Science Fiction'],
      collections: ['c1'],
      format: 'paperback',
      propertyStatus: 'owned',
      progress: {
        status: 'reading',
        startedAt: '2026-02-01T00:00:00.000Z',
        finishedAt: null,
        currentPage: 150,
        notes: [
          { id: 'n1', createdAt: '2026-02-02T00:00:00.000Z', content: 'x' },
        ],
      },
    } satisfies Book

    const db = {
      ...bookToDbBook(book),
      id: book.id,
      created_at: book.createdAt,
    }
    expect(db.current_page).toBe(150)
    expect(dbBookToBook(db, book.collections)).toEqual(book)
  })
})
