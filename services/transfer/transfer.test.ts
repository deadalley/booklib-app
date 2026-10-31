import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Author } from '~/types/author'
import type { Book } from '~/types/book'
import {
  FIELDS,
  bookToRecord,
  formatFromFileName,
  normalizeRows,
  parseBookFile,
  planImport,
  recordToBook,
  resolveFieldKey,
  serializeBooks,
  type BookRecord,
} from '.'

const template = (name: string) =>
  readFileSync(resolve(__dirname, '../../public/templates', name), 'utf8')

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'b1',
    title: 'Piranesi',
    author: 'a1',
    coverSrc: 'https://example.com/cover.jpg',
    createdAt: '2024-01-02T10:00:00.000Z',
    isbn: '978-1-63557-563-7',
    language: 'en',
    originalTitle: 'Piranesi',
    originalLanguage: 'en',
    pages: 272,
    publisher: 'Bloomsbury',
    rating: 4,
    summary: 'A house of endless halls, with "quotes", commas, and\nnewlines.',
    year: 2020,
    genres: ['Fantasy', 'Mystery'],
    collections: ['c1'],
    format: 'ebook',
    propertyStatus: 'owned',
    progress: {
      status: 'reading',
      startedAt: '2024-02-01T00:00:00.000Z',
      finishedAt: null,
      currentPage: 120,
      notes: [
        {
          createdAt: '2024-02-03T00:00:00.000Z',
          page: 100,
          content: 'The statues; again.',
        },
      ],
    },
    ...overrides,
  }
}

const authors: Author[] = [
  { id: 'a1', name: 'Susanna Clarke', createdAt: '2024-01-01T00:00:00.000Z' },
]

describe('field registry', () => {
  it('has unique keys and headers', () => {
    expect(new Set(FIELDS.map((f) => f.key)).size).toBe(FIELDS.length)
    expect(new Set(FIELDS.map((f) => f.header)).size).toBe(FIELDS.length)
  })

  it.each([
    ['TITLE', 'title'],
    ['Original Title', 'originalTitle'],
    ['original_language', 'originalLanguage'],
    ['BOOK_FORMAT', 'format'],
    ['progress_status', 'progressStatus'],
    ['Date Read', 'finishedAt'],
    ['My Rating', 'rating'],
    ['ISBN13', 'isbn'],
    ['cover_src', 'coverSrc'],
  ])('resolves column "%s" to %s', (column, key) => {
    expect(resolveFieldKey(column)).toBe(key)
  })

  it('infers the format from the file name', () => {
    expect(formatFromFileName('books.CSV')).toBe('csv')
    expect(formatFromFileName('backup.json')).toBe('json')
    expect(formatFromFileName('books.xlsx')).toBeNull()
  })
})

describe('normalizeRows', () => {
  it('coerces every field type', () => {
    const { records, issues } = normalizeRows([
      {
        TITLE: '  Dune ',
        AUTHOR: 'Frank Herbert',
        LANGUAGE: 'English',
        ORIGINAL_LANGUAGE: 'en',
        YEAR: '1965',
        PAGES: '412',
        RATING: '4',
        GENRES: 'Science Fiction; Classics ;science fiction',
        BOOK_FORMAT: 'Mass Market Paperback',
        PROPERTY_STATUS: 'yes',
        PROGRESS_STATUS: 'CURRENTLY_READING',
        STARTED_AT: '2024/03/01',
        FINISHED_AT: '',
        CURRENT_PAGE: '50',
        NOTES: '[{"createdAt":"2024-03-02","page":10,"content":"Spice"}]',
      },
    ])

    expect(issues).toEqual([])
    expect(records).toHaveLength(1)
    const [record] = records as [BookRecord]
    expect(record).toMatchObject({
      title: 'Dune',
      author: 'Frank Herbert',
      language: 'en',
      originalLanguage: 'en',
      year: 1965,
      pages: 412,
      rating: 4,
      genres: ['Science Fiction', 'Classics'],
      format: 'paperback',
      propertyStatus: 'owned',
      progress: {
        status: 'reading',
        startedAt: '2024-03-01T00:00:00.000Z',
        finishedAt: null,
        currentPage: 50,
        notes: [
          { createdAt: '2024-03-02T00:00:00.000Z', page: 10, content: 'Spice' },
        ],
      },
    })
  })

  it('reads nested BookLib progress objects', () => {
    const { records } = normalizeRows([
      {
        title: 'Book',
        progress: {
          status: 'read',
          startedAt: '2024-01-01T00:00:00.000Z',
          finishedAt: '2024-01-10T00:00:00.000Z',
          currentPage: null,
          notes: [],
        },
      },
    ])
    expect(records[0]?.progress.status).toBe('read')
    expect(records[0]?.progress.finishedAt).toBe('2024-01-10T00:00:00.000Z')
  })

  it('skips rows without a title and reports bad values without throwing', () => {
    const { records, issues, rows } = normalizeRows([
      { TITLE: '', AUTHOR: 'Nobody' },
      {
        TITLE: 'Bad values',
        YEAR: 'soon',
        RATING: '11',
        FORMAT: 'scroll',
        STARTED_AT: '31/12/2024',
        WHATEVER: 'x',
      },
    ])

    expect(records).toHaveLength(1)
    expect(rows).toEqual([2])
    expect(records[0]).toMatchObject({
      title: 'Bad values',
      year: null,
      rating: null,
      format: null,
      progress: { startedAt: null },
    })
    expect(issues.filter((i) => i.severity === 'error')).toEqual([
      expect.objectContaining({ row: 1, field: 'title' }),
    ])
    const warningFields = issues
      .filter((i) => i.severity === 'warning')
      .map((i) => i.field ?? 'file')
    expect(warningFields).toEqual(
      expect.arrayContaining(['file', 'year', 'rating', 'format', 'startedAt']),
    )
  })

  it('treats 0 year/pages/rating as unknown', () => {
    const { records } = normalizeRows([
      { title: 'x', year: 0, pages: '0', rating: 0 },
    ])
    expect(records[0]).toMatchObject({ year: null, pages: null, rating: null })
  })

  it('rejects impossible calendar dates', () => {
    const { records, issues } = normalizeRows([
      { title: 'x', startedAt: '2024-02-31' },
    ])
    expect(records[0]?.progress.startedAt).toBeNull()
    expect(issues[0]?.field).toBe('startedAt')
  })
})

describe('parseBookFile', () => {
  it('parses the CSV template without issues', () => {
    const { records, issues } = parseBookFile(template('template.csv'), 'csv')
    expect(issues).toEqual([])
    expect(records.length).toBeGreaterThan(0)
    expect(records[0]?.progress.notes[0]?.content).toBeTruthy()
  })

  it('parses the JSON template without issues', () => {
    const { records, issues } = parseBookFile(template('template.json'), 'json')
    expect(issues).toEqual([])
    expect(records.length).toBeGreaterThan(0)
  })

  it('CSV and JSON templates describe the same books', () => {
    const csv = parseBookFile(template('template.csv'), 'csv').records
    const json = parseBookFile(template('template.json'), 'json').records
    expect(csv).toEqual(json)
  })

  it('the CSV template uses every canonical header', () => {
    const header = template('template.csv').split('\n')[0]?.split(',')
    expect(header).toEqual(FIELDS.map((f) => f.header))
  })

  it('reads a legacy flat JSON file', () => {
    const { records } = parseBookFile(
      JSON.stringify({
        books: [{ id: 1, title: 'Old', progressStatus: 'read', pages: '' }],
      }),
      'json',
    )
    expect(records[0]).toMatchObject({
      title: 'Old',
      pages: null,
      progress: { status: 'read' },
    })
  })

  it('reads a raw database backup and resolves author ids to names', () => {
    const { records, issues } = parseBookFile(
      JSON.stringify({
        authors: [{ id: 'a1', name: 'Susanna Clarke', created_at: '' }],
        collections: [],
        'collection-book': [],
        goals: [],
        books: [
          {
            id: 'b1',
            title: 'Piranesi',
            author_id: 'a1',
            progress_status: 'read',
            started_at: '2024-01-01T00:00:00.000Z',
            finished_at: '2024-01-05T00:00:00.000Z',
            original_language: 'en',
            cover_src: null,
            notes: [],
            collections: ['c1'],
            property_status: 'owned',
            current_page: 272,
          },
        ],
      }),
      'json',
    )
    expect(issues).toEqual([])
    expect(records[0]).toMatchObject({
      title: 'Piranesi',
      author: 'Susanna Clarke',
      originalLanguage: 'en',
      propertyStatus: 'owned',
      progress: {
        status: 'read',
        finishedAt: '2024-01-05T00:00:00.000Z',
        currentPage: 272,
      },
    })
  })

  it('reports malformed files as errors', () => {
    expect(parseBookFile('{not json', 'json').issues[0]).toMatchObject({
      row: 0,
      severity: 'error',
    })
    expect(parseBookFile('{"foo": 1}', 'json').records).toEqual([])
    expect(parseBookFile('', 'csv').issues[0]?.severity).toBe('error')
  })

  it('ignores a UTF-8 byte-order mark', () => {
    const { records, issues } = parseBookFile(
      '\uFEFFTITLE,PAGES\nDune,412\n',
      'csv',
    )
    expect(issues).toEqual([])
    expect(records[0]).toMatchObject({ title: 'Dune', pages: 412 })
  })

  it('refuses files from a newer format version', () => {
    const result = parseBookFile(
      JSON.stringify({ format: 'booklib', version: 99, books: [] }),
      'json',
    )
    expect(result.issues[0]?.message).toMatch(/newer version/)
  })
})

describe('round trip', () => {
  it.each(['csv', 'json'] as const)(
    'export → import keeps every field (%s)',
    (format) => {
      const book = makeBook()
      const record = bookToRecord(book, new Map(authors.map((a) => [a.id, a])))
      const text = serializeBooks([record], format)
      const { records, issues } = parseBookFile(text, format)

      expect(issues).toEqual([])
      expect(records).toEqual([record])

      const imported = recordToBook(records[0]!, 'new-id')
      expect(imported).toEqual({
        ...book,
        id: 'new-id',
        author: 'Susanna Clarke',
        collections: [],
      })
    },
  )

  it('exports the author by name', () => {
    const record = bookToRecord(makeBook(), { a1: authors[0]! })
    expect(record.author).toBe('Susanna Clarke')
    expect(record).not.toHaveProperty('collections')
  })
})

describe('planImport', () => {
  const library = {
    books: [makeBook()],
    authors,
  }

  it('flags duplicates by ISBN and by title + author, also within the file', () => {
    const { records } = normalizeRows([
      { title: 'Something else', isbn: '9781635575637' },
      { title: 'piranesi ', author: 'SUSANNA CLARKE' },
      { title: 'New Book', author: 'New Author' },
      { title: 'New Book', author: 'new author' },
    ])
    const plan = planImport(records, library)
    expect(plan.items.map((i) => i.duplicateOf)).toEqual([
      'Piranesi',
      'Piranesi',
      null,
      'New Book',
    ])
  })

  it('lists only authors that do not exist yet, once', () => {
    const { records } = normalizeRows([
      { title: 'A', author: 'Susanna Clarke' },
      { title: 'B', author: 'Ted Chiang' },
      { title: 'C', author: 'ted chiang' },
      { title: 'D' },
    ])
    expect(planImport(records, library).newAuthors).toEqual(['Ted Chiang'])
  })
})
