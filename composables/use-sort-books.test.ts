import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { ViewBook } from '~/types/book'
import { useSortBooks } from './use-sort-books'

function book(id: string, overrides: Partial<ViewBook> = {}): ViewBook {
  return {
    id,
    title: `Book ${id}`,
    author: null,
    coverSrc: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    isbn: null,
    language: 'en',
    originalTitle: null,
    originalLanguage: null,
    pages: 200,
    publisher: 'Penguin',
    rating: null,
    summary: null,
    year: 2000,
    genres: [],
    collections: [],
    format: null,
    propertyStatus: null,
    progress: {
      status: null,
      startedAt: null,
      finishedAt: null,
      currentPage: null,
      notes: [],
    },
    ...overrides,
  }
}

const ids = (books: ViewBook[]) => books.map(({ id }) => id)

describe('useSortBooks', () => {
  it('combines filter categories with AND', () => {
    const books = ref([
      book('1', { publisher: 'Penguin', language: 'en' }),
      book('2', { publisher: 'Penguin', language: 'es' }),
      book('3', { publisher: 'Other', language: 'en' }),
    ])
    const { sortedBooks, selectedPublishers, selectedLanguages } =
      useSortBooks(books)

    selectedPublishers.value = ['penguin']
    selectedLanguages.value = ['en']
    expect(ids(sortedBooks.value)).toEqual(['1'])
  })

  it('filters collections by id', () => {
    const books = ref([
      book('1', { collections: ['c1'] }),
      book('2', { collections: ['c2'] }),
    ])
    const { sortedBooks, selectedCollections } = useSortBooks(books)
    selectedCollections.value = ['c2']
    expect(ids(sortedBooks.value)).toEqual(['2'])
  })

  it('shows future publication years and long books by default', async () => {
    const books = ref([book('1')])
    const { sortedBooks } = useSortBooks(books)

    books.value = [
      ...books.value,
      book('2', { year: new Date().getFullYear() + 1 }),
      book('3', { pages: 1200 }),
    ]
    await nextTick()
    expect(ids(sortedBooks.value)).toEqual(['1', '2', '3'])
  })

  it('applies a narrowed range', () => {
    const books = ref([book('1', { year: 1990 }), book('2', { year: 2010 })])
    const { sortedBooks, selectedYearRange, filterCount } = useSortBooks(books)
    selectedYearRange.value = [2000, selectedYearRange.value[1]]
    expect(ids(sortedBooks.value)).toEqual(['2'])
    expect(filterCount.value).toBe(1)
  })

  it('resets every filter, including collections and formats', () => {
    const books = ref([book('1', { collections: ['c1'], format: 'ebook' })])
    const {
      selectedCollections,
      selectedFormats,
      selectedAuthor,
      filterCount,
      onResetFilter,
    } = useSortBooks(books)

    selectedCollections.value = ['c9']
    selectedFormats.value = ['paperback']
    selectedAuthor.value = 'a1'
    expect(filterCount.value).toBe(3)

    onResetFilter()
    expect(selectedCollections.value).toEqual([])
    expect(selectedFormats.value).toEqual([])
    expect(filterCount.value).toBe(0)
  })

  it('keeps the current page in range when books are removed', async () => {
    const books = ref(
      Array.from({ length: BOOKS_PAGE_SIZE * 3 }, (_, i) => book(String(i))),
    )
    const { currentPage, pageCount } = useSortBooks(books)
    currentPage.value = 3
    expect(pageCount.value).toBe(3)

    books.value = books.value.slice(0, BOOKS_PAGE_SIZE + 1)
    await nextTick()
    expect(currentPage.value).toBe(2)
  })
})
