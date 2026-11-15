import { describe, expect, it } from 'vitest'
import type { Book, BookProgress } from '~/types/book'
import {
  getBookFinishedAt,
  isBookFinished,
  withProgressStatus,
} from './book-progress'

const withProgress = (
  progress: Partial<BookProgress>,
): Pick<Book, 'progress'> => ({
  progress: {
    status: 'read',
    startedAt: null,
    finishedAt: null,
    notes: [],
    currentPage: null,
    ...progress,
  },
})

describe('isBookFinished', () => {
  it('is true for every read book, whatever its logs', () => {
    expect(isBookFinished(withProgress({ currentPage: 12 }))).toBe(true)
    expect(isBookFinished(withProgress({ status: 'reading' }))).toBe(false)
    expect(isBookFinished(withProgress({ status: 'not-finished' }))).toBe(false)
  })
})

describe('getBookFinishedAt', () => {
  it('prefers the finish date', () => {
    expect(
      getBookFinishedAt(
        withProgress({
          finishedAt: '2026-03-01T00:00:00.000Z',
          notes: [{ createdAt: '2026-05-01T00:00:00.000Z', content: '' }],
        }),
      ),
    ).toBe('2026-03-01T00:00:00.000Z')
  })

  it('falls back to the last log entry, then the start date', () => {
    expect(
      getBookFinishedAt(
        withProgress({
          startedAt: '2026-01-01T00:00:00.000Z',
          notes: [
            { createdAt: '2026-04-01T00:00:00.000Z', content: '' },
            { createdAt: '2026-02-01T00:00:00.000Z', content: '' },
          ],
        }),
      ),
    ).toBe('2026-04-01T00:00:00.000Z')
    expect(
      getBookFinishedAt(
        withProgress({ startedAt: '2026-01-01T00:00:00.000Z' }),
      ),
    ).toBe('2026-01-01T00:00:00.000Z')
  })

  it('is null without any date or when not read', () => {
    expect(getBookFinishedAt(withProgress({}))).toBeNull()
    expect(
      getBookFinishedAt(
        withProgress({ status: 'reading', finishedAt: '2026-03-01' }),
      ),
    ).toBeNull()
  })
})

describe('withProgressStatus', () => {
  const base = withProgress({
    status: 'reading',
    startedAt: '2026-01-01T00:00:00.000Z',
    currentPage: 40,
  }).progress

  it('records a finish date when read or not finished', () => {
    const read = withProgressStatus(base, 'read')
    expect(read.status).toBe('read')
    expect(read.finishedAt).toBeTruthy()
    expect(read.startedAt).toBe(base.startedAt)
    // An existing finish date is kept
    expect(
      withProgressStatus({ ...base, finishedAt: '2026-02-01' }, 'not-finished')
        .finishedAt,
    ).toBe('2026-02-01')
  })

  it('clears the finish date when reading again', () => {
    const again = withProgressStatus({ ...read(), status: 'read' }, 'reading')
    expect(again.finishedAt).toBeNull()
    expect(again.startedAt).toBe(base.startedAt)
  })

  it('starts today unless a start date is given, and resets progress', () => {
    const fresh = withProgress({ status: null }).progress
    expect(withProgressStatus(fresh, 'reading').startedAt).toBeTruthy()
    expect(
      withProgressStatus(fresh, 'reading', '2026-03-01T00:00:00.000Z')
        .startedAt,
    ).toBe('2026-03-01T00:00:00.000Z')
    expect(withProgressStatus(base, null)).toMatchObject({
      status: null,
      startedAt: null,
      currentPage: null,
      finishedAt: null,
    })
  })

  function read() {
    return { ...base, finishedAt: '2026-02-01T00:00:00.000Z' }
  }
})
