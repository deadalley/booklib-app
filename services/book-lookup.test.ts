import { describe, expect, it, vi } from 'vitest'
import {
  bookPatchFromLookup,
  lookupIsbn,
  LookupOfflineError,
  type BookLookupResult,
} from './book-lookup'

const ISBN = '9780060512750'

const openLibrary = {
  [`ISBN:${ISBN}`]: {
    title: 'The Dispossessed',
    authors: [{ name: 'Ursula K. Le Guin' }],
    publishers: [{ name: 'Harper Perennial' }],
    publish_date: 'October 2003',
    number_of_pages: 387,
    cover: { large: 'https://covers.openlibrary.org/b/id/1-L.jpg' },
  },
}

const google = {
  items: [
    {
      volumeInfo: {
        title: 'The Dispossessed: An Ambiguous Utopia',
        authors: ['Ursula K. Le Guin'],
        pageCount: 400,
        description: '<p>Shevek &#38; Takver,<br>a brilliant physicist.</p>',
        language: 'en',
        categories: ['Fiction / Science Fiction / General'],
      },
    },
  ],
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status })
}

function fakeFetch(responses: { openLibrary?: unknown; google?: unknown }) {
  return vi.fn(async (url: string | URL | Request) =>
    String(url).includes('openlibrary')
      ? json(responses.openLibrary ?? {})
      : json(responses.google ?? {}),
  ) as unknown as typeof fetch
}

describe('lookupIsbn', () => {
  it('takes bibliographic fields from Open Library and fills the rest from Google Books', async () => {
    const result = await lookupIsbn(ISBN, fakeFetch({ openLibrary, google }))
    expect(result).toEqual({
      isbn: ISBN,
      title: 'The Dispossessed',
      author: 'Ursula K. Le Guin',
      publisher: 'Harper Perennial',
      year: 2003,
      pages: 387,
      language: 'en',
      summary: 'Shevek & Takver,\na brilliant physicist.',
      genres: ['Science Fiction'],
      coverUrl: 'https://covers.openlibrary.org/b/id/1-L.jpg',
    })
  })

  it('uses Google Books alone when Open Library has nothing', async () => {
    const result = await lookupIsbn(ISBN, fakeFetch({ google }))
    expect(result).toMatchObject({
      title: 'The Dispossessed: An Ambiguous Utopia',
      pages: 400,
      coverUrl: null,
    })
  })

  it('returns null for an unknown ISBN', async () => {
    expect(await lookupIsbn(ISBN, fakeFetch({}))).toBeNull()
  })

  it('reports offline when neither service can be reached', async () => {
    const failing = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    }) as unknown as typeof fetch
    await expect(lookupIsbn(ISBN, failing)).rejects.toBeInstanceOf(
      LookupOfflineError,
    )
  })

  it('still answers when one service fails', async () => {
    const fetchFn = vi.fn(async (url: string | URL | Request) => {
      if (String(url).includes('googleapis')) throw new TypeError('down')
      return json(openLibrary)
    }) as unknown as typeof fetch
    expect((await lookupIsbn(ISBN, fetchFn))?.title).toBe('The Dispossessed')
  })
})

describe('bookPatchFromLookup', () => {
  const result: BookLookupResult = {
    isbn: ISBN,
    title: 'The Dispossessed',
    author: 'Ursula K. Le Guin',
    publisher: 'Harper',
    year: 1974,
    pages: 387,
    language: 'en',
    summary: null,
    genres: ['Science Fiction'],
    coverUrl: null,
  }

  it('matches an existing author by name, ignoring case and accents', () => {
    const patch = bookPatchFromLookup(result, {}, [
      { id: 'a1', name: 'ursula k. le guín' },
    ])
    expect(patch.author).toBe('a1')
    expect(patch).not.toHaveProperty('summary')
  })

  it('keeps a new author as a name', () => {
    expect(bookPatchFromLookup(result, {}, []).author).toBe('Ursula K. Le Guin')
  })

  it('only fills empty fields when asked', () => {
    const patch = bookPatchFromLookup(
      result,
      { title: 'My title', pages: null, genres: [] },
      [],
      { onlyEmpty: true },
    )
    expect(patch).not.toHaveProperty('title')
    expect(patch).toMatchObject({ pages: 387, genres: ['Science Fiction'] })
  })
})
