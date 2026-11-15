import { describe, expect, it } from 'vitest'
import type { Book } from '~/types/book'
import { joinWithAnd, previewBulkChange } from './bulk-edit'

function book(id: string, overrides: Partial<Book> = {}): Book {
  return {
    id,
    title: id,
    coverSrc: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    isbn: null,
    language: null,
    originalTitle: null,
    originalLanguage: null,
    pages: null,
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

const context = {
  authors: [
    { id: 'a1', name: 'Octavia E. Butler' },
    { id: 'a2', name: 'Ursula K. Le Guin' },
  ],
  genres: ['Classics', 'Fantasy'],
}

describe('previewBulkChange', () => {
  it('names the status and the finish date it records', () => {
    const books = [book('1'), book('2')]
    expect(
      previewBulkChange({ field: 'status', status: 'read' }, books, context),
    ).toEqual({
      from: '2 books',
      to: 'Read',
      detail: 'A finish date of today is recorded on each book.',
      action: 'Mark 2 books as Read',
      done: 'Marked as Read',
    })
  })

  it('counts books that already have the author', () => {
    const books = [book('1', { author: 'a1' }), book('2'), book('3')]
    const preview = previewBulkChange(
      { field: 'author', author: 'a1' },
      books,
      context,
    )
    expect(preview.to).toBe('Octavia E. Butler')
    expect(preview.detail).toBe(
      'Replaces the author on 2 books. 1 book already has this author.',
    )
    expect(preview.action).toBe('Set author for 3 books')
  })

  it('marks a typed author as new', () => {
    const preview = previewBulkChange(
      { field: 'author', author: 'Ursula' },
      [book('1'), book('2')],
      context,
    )
    expect(preview.to).toBe('Ursula (new)')
    expect(preview.detail).toBe(
      'Creates the author “Ursula” and assigns it to all 2 books.',
    )
  })

  it('previews adding and removing a genre', () => {
    const books = [
      book('1', { genres: ['Fantasy'] }),
      book('2', { genres: ['Fantasy'] }),
      book('3'),
    ]
    const add = previewBulkChange(
      { field: 'genre', genre: 'Fantasy', mode: 'add' },
      books,
      context,
    )
    expect(add.detail).toBe(
      '2 of the 3 already have Fantasy and stay as they are.',
    )
    expect(add.action).toBe('Add Fantasy to 3 books')

    const remove = previewBulkChange(
      { field: 'genre', genre: 'Fantasy', mode: 'remove' },
      books,
      context,
    )
    expect(remove).toMatchObject({
      from: 'Fantasy on 2 books',
      to: 'Removed',
      detail: '1 book doesn’t have Fantasy and stays as it is.',
      action: 'Remove Fantasy from 2 books',
    })
  })

  it('lists the current formats', () => {
    const books = [
      book('1', { format: 'hardcover' }),
      book('2', { format: 'hardcover' }),
      book('3', { format: 'ebook' }),
    ]
    const preview = previewBulkChange(
      { field: 'format', format: 'paperback' },
      books,
      context,
    )
    expect(preview.detail).toBe('Currently 2 Hardcover and 1 E-book.')
    expect(preview.action).toBe('Set 3 books to Paperback')
  })

  it('previews setting and clearing a rating', () => {
    const books = [
      book('1', { rating: 3 }),
      book('2'),
      book('3', { rating: 4 }),
    ]
    expect(
      previewBulkChange({ field: 'rating', rating: 4.5 }, books, context),
    ).toMatchObject({
      to: '4.5 stars',
      detail: 'Replaces the existing rating on 2 books.',
      action: 'Rate 3 books 4.5 stars',
    })
    expect(
      previewBulkChange({ field: 'rating', rating: null }, books, context),
    ).toMatchObject({
      to: 'No rating',
      detail: 'Clears the rating on 2 books. 1 book has none.',
      action: 'Clear rating on 2 books',
    })
  })
})

describe('joinWithAnd', () => {
  it('joins with commas and a final "and"', () => {
    expect(joinWithAnd(['a'])).toBe('a')
    expect(joinWithAnd(['a', 'b', 'c'])).toBe('a, b and c')
  })
})
