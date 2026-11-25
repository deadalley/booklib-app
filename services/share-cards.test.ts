import { describe, expect, it } from 'vitest'
import type { Book } from '~/types/book'
import {
  bookCardStatus,
  clampLines,
  quoteFontSize,
  wrapText,
} from './share-cards'
import { slugify } from '~/utils/string'

// One unit per character
const measure = (line: string) => line.length

describe('share cards', () => {
  it('wraps words to the width', () => {
    expect(wrapText('the quick brown fox jumps', 10, measure)).toEqual([
      'the quick',
      'brown fox',
      'jumps',
    ])
    // A word longer than the width keeps its own line
    expect(wrapText('extraordinarily so', 5, measure)).toEqual([
      'extraordinarily',
      'so',
    ])
    expect(wrapText('  ', 10, measure)).toEqual([])
  })

  it('clamps lines with an ellipsis', () => {
    expect(clampLines(['a', 'b'], 3)).toEqual(['a', 'b'])
    expect(clampLines(['one', 'two,', 'three'], 2)).toEqual(['one', 'two…'])
  })

  it('makes long quotes smaller', () => {
    const sizes = [40, 120, 200, 400, 900].map(quoteFontSize)
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a))
    expect(new Set(sizes).size).toBe(sizes.length)
  })

  it('describes where the book stands', () => {
    const book = (progress: Partial<Book['progress']>) =>
      ({
        progress: {
          status: null,
          startedAt: null,
          finishedAt: null,
          notes: [],
          ...progress,
        },
      }) as unknown as Book
    expect(
      bookCardStatus(
        book({ status: 'read', finishedAt: '2026-03-14T00:00:00.000Z' }),
      ),
    ).toBe('Finished in March 2026')
    expect(bookCardStatus(book({ status: 'reading' }))).toBe('Reading now')
    expect(bookCardStatus(book({ status: 'not-finished' }))).toBe('Set aside')
    expect(bookCardStatus(book({}))).toBe('On my shelf')
  })

  it('slugifies titles for file names', () => {
    expect(slugify('Les Misérables: Tome 1')).toBe('les-miserables-tome-1')
    expect(slugify('!!!')).toBe('booklib')
  })
})
