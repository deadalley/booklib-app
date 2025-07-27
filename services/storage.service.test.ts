import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { LowSync } from 'lowdb'
import type { Database } from '~/types/api'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import { StorageService, useBookLibService } from './storage.service'
import type { BookDB, AuthorDB, CollectionDB, GoalDB } from '~/types/database'

// Mock LowDB LocalStorage
vi.mock('lowdb/browser', () => ({
  LocalStoragePreset: vi
    .fn()
    .mockImplementation((key: string, defaultData: Database) => {
      const data = defaultData
      return {
        data,
        read: vi.fn(),
        write: vi.fn(),
      } as unknown as LowSync<Database>
    }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock logger
vi.mock('../utils', () => ({
  logger: {
    error: vi.fn(),
  },
  DEFAULT_COLLECTIONS_INIT: [
    { id: '1', name: 'Read' },
    { id: '2', name: 'Currently Reading' },
    { id: '3', name: 'Want to Read' },
  ],
  now: vi.fn(() => '2023-01-01T00:00:00.000Z'),
  dbBookToBook: vi.fn((book: BookDB, collections: string[]) => ({
    ...book,
    collections,
    author: book.author_id,
    createdAt: book.created_at,
    coverSrc: book.cover_src,
    progressStatus: book.progress_status,
    startedAt: book.started_at,
    finishedAt: book.finished_at,
    originalTitle: book.original_title,
    originalLanguage: book.original_language,
  })),
  bookToDbBook: vi.fn((book: Book) => ({
    ...book,
    author_id: book.author,
    created_at: book.createdAt,
    cover_src: book.coverSrc,
    progress_status: book.progressStatus,
    started_at: book.startedAt,
    finished_at: book.finishedAt,
    original_title: book.originalTitle,
    original_language: book.originalLanguage,
  })),
  dbAuthorToAuthor: vi.fn((author: AuthorDB) => ({
    ...author,
    createdAt: author.created_at,
  })),
  dbCollectionToCollection: vi.fn(
    (
      collection: CollectionDB,
      books: Array<{ book_id: string; order: number }>,
    ) => ({
      ...collection,
      createdAt: collection.created_at,
      books: books.map((b) => ({ id: b.book_id, order: b.order })),
    }),
  ),
  dbGoalToGoal: vi.fn((goal: GoalDB) => ({
    ...goal,
    createdAt: goal.created_at,
    startAt: goal.start_at,
    finishAt: goal.finish_at,
    completedAt: goal.completed_at,
  })),
  goalToDbGoal: vi.fn((goal: Goal) => ({
    ...goal,
    created_at: goal.createdAt,
    start_at: goal.startAt,
    finish_at: goal.finishAt,
    completed_at: goal.completedAt,
  })),
}))

describe('StorageService', () => {
  let service: StorageService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new StorageService()
  })

  describe('initialization', () => {
    it('should initialize the service', async () => {
      await service.initialize()
      expect(service['isInitialized']).toBe(true)
    })

    it('should not reinitialize if already initialized', async () => {
      await service.initialize()
      const client = service['client']
      await service.initialize()
      expect(service['client']).toBe(client)
    })
  })

  describe('authors', () => {
    beforeEach(async () => {
      await service.initialize()
      // Mock initial data
      service['client']!.data = {
        authors: [
          { id: '1', name: 'John Doe', created_at: '2023-01-01T00:00:00.000Z' },
          {
            id: '2',
            name: 'Jane Smith',
            created_at: '2023-01-02T00:00:00.000Z',
          },
        ],
        books: [],
        collections: [],
        'collection-book': [],
        goals: [],
      }
    })

    it('should get all authors', async () => {
      const authors = await service.getAuthors()
      expect(authors).toHaveLength(2)
      expect(authors[0].name).toBe('John Doe')
    })

    it('should delete an author and optionally delete books', async () => {
      service['client']!.data.books = [
        {
          id: '1',
          title: 'Book 1',
          author_id: '1',
          created_at: '2023-01-01T00:00:00.000Z',
        } as BookDB,
        {
          id: '2',
          title: 'Book 2',
          author_id: '2',
          created_at: '2023-01-01T00:00:00.000Z',
        } as BookDB,
      ]

      await service.deleteAuthor('1', { deleteBooks: true })

      expect(service['client']!.data.authors).toHaveLength(1)
      expect(service['client']!.data.books).toHaveLength(1)
      expect(service['client']!.data.books[0].author_id).toBe('2')
    })

    it('should delete an author and set books author_id to null', async () => {
      service['client']!.data.books = [
        {
          id: '1',
          title: 'Book 1',
          author_id: '1',
          created_at: '2023-01-01T00:00:00.000Z',
        } as BookDB,
      ]

      await service.deleteAuthor('1', { deleteBooks: false })

      expect(service['client']!.data.authors).toHaveLength(1)
      expect(service['client']!.data.books).toHaveLength(1)
      expect(service['client']!.data.books[0].author_id).toBeNull()
    })
  })

  describe('books', () => {
    beforeEach(async () => {
      await service.initialize()
      service['client']!.data = {
        authors: [
          { id: '1', name: 'John Doe', created_at: '2023-01-01T00:00:00.000Z' },
        ],
        books: [
          {
            id: '1',
            title: 'Test Book',
            author_id: '1',
            created_at: '2023-01-01T00:00:00.000Z',
            progress_status: 'read',
          } as BookDB,
        ],
        collections: [
          {
            id: '1',
            name: 'Test Collection',
            created_at: '2023-01-01T00:00:00.000Z',
          },
        ],
        'collection-book': [{ book_id: '1', collection_id: '1', order: 0 }],
        goals: [],
      }
    })

    it('should get a book by id', async () => {
      const book = await service.getBook('1')
      expect(book).toBeDefined()
      expect(book!.title).toBe('Test Book')
      expect(book!.collections).toEqual(['1'])
    })

    it('should get books with filters', async () => {
      const books = await service.getBooks({ bookProgress: 'read' })
      expect(books).toHaveLength(1)
      expect(books[0].title).toBe('Test Book')
    })

    it('should create a new book', async () => {
      const newBook: Book = {
        id: '2',
        title: 'New Book',
        author: '1',
        collections: ['1'],
        createdAt: '2023-01-01T00:00:00.000Z',
        coverSrc: null,
        isbn: null,
        language: null,
        originalTitle: null,
        originalLanguage: null,
        pages: null,
        publisher: null,
        rating: null,
        summary: null,
        year: null,
        genres: null,
        progressStatus: 'not-read',
        format: null,
        startedAt: null,
        finishedAt: null,
      }

      const createdBook = await service.createBook(newBook)
      expect(createdBook).toBeDefined()
      expect(service['client']!.data.books).toHaveLength(2)
      expect(service['client']!.data['collection-book']).toHaveLength(2)
    })

    it('should delete a book', async () => {
      const result = await service.deleteBook('1')
      expect(result).toBe('1')
      expect(service['client']!.data.books).toHaveLength(0)
      expect(service['client']!.data['collection-book']).toHaveLength(0)
    })
  })

  describe('collections', () => {
    beforeEach(async () => {
      await service.initialize()
      service['client']!.data = {
        authors: [],
        books: [
          {
            id: '1',
            title: 'Book 1',
            created_at: '2023-01-01T00:00:00.000Z',
          } as BookDB,
        ],
        collections: [
          {
            id: '1',
            name: 'Test Collection',
            created_at: '2023-01-01T00:00:00.000Z',
          },
        ],
        'collection-book': [{ book_id: '1', collection_id: '1', order: 0 }],
        goals: [],
      }
    })

    it('should get all collections', async () => {
      const collections = await service.getCollections()
      expect(collections.length).toBeGreaterThan(0)
    })

    it('should get a collection by id', async () => {
      const collection = await service.getCollection('1')
      expect(collection).toBeDefined()
      expect(collection!.name).toBe('Test Collection')
      expect(collection!.books).toHaveLength(1)
    })

    it('should create a new collection', async () => {
      const newCollection: Collection = {
        id: '2',
        name: 'New Collection',
        createdAt: '2023-01-01T00:00:00.000Z',
        books: [{ id: '1', order: 0 }],
      }

      const created = await service.createCollection(newCollection)
      expect(created).toBeDefined()
      expect(service['client']!.data.collections.length).toBeGreaterThan(1)
    })

    it('should delete a collection', async () => {
      const result = await service.deleteCollection('1', { deleteBooks: false })
      expect(result).toBe('1')
      expect(
        service['client']!.data.collections.filter((c) => c.id === '1'),
      ).toHaveLength(0)
    })
  })

  describe('goals', () => {
    beforeEach(async () => {
      await service.initialize()
      service['client']!.data = {
        authors: [],
        books: [],
        collections: [],
        'collection-book': [],
        goals: [
          {
            id: '1',
            title: 'Read 10 books',
            type: 'books',
            amount: 10,
            created_at: '2023-01-01T00:00:00.000Z',
          } as GoalDB,
        ],
      }
    })

    it('should get all goals', async () => {
      const goals = await service.getGoals()
      expect(goals).toHaveLength(1)
      expect(goals[0].title).toBe('Read 10 books')
    })

    it('should create a new goal', async () => {
      const newGoal: Goal = {
        id: '2',
        title: 'Read 20 books',
        type: 'books',
        interval: 'yearly',
        amount: 20,
        createdAt: '2023-01-01T00:00:00.000Z',
        startAt: '2023-01-01T00:00:00.000Z',
        finishAt: '2023-12-31T23:59:59.999Z',
        completedAt: null,
        status: 'tracking',
        author: null,
        genres: [],
        entries: [],
      } as Goal

      const created = await service.createGoal(newGoal)
      expect(created).toBeDefined()
      expect(service['client']!.data.goals).toHaveLength(2)
    })
  })

  describe('library management', () => {
    it('should check if library is empty', async () => {
      await service.initialize()
      service['client']!.data.books = []

      const isEmpty = await service.isLibraryEmpty()
      expect(isEmpty).toBe(true)
    })

    it('should reset library', async () => {
      await service.initialize()
      service['client']!.data.books = [{ id: '1' } as BookDB]

      await service.resetLibrary()
      expect(service['client']!.data.books).toHaveLength(0)
    })

    it('should check library integrity', async () => {
      await service.initialize()
      service['client']!.data = {
        authors: [],
        books: [{ id: '1', author_id: 'missing-author' } as BookDB],
        collections: [],
        'collection-book': [
          {
            book_id: 'missing-book',
            collection_id: 'missing-collection',
            order: 0,
          },
        ],
        goals: [],
      }

      const result = await service.checkLibraryIntegrity()
      expect(result.authors.length).toBeGreaterThan(0)
      expect(result.books.length).toBeGreaterThan(0)
      expect(result.collections.length).toBeGreaterThan(0)
    })

    it('should import library data', async () => {
      await service.initialize()
      const importData: Database = {
        authors: [
          {
            id: '1',
            name: 'Imported Author',
            created_at: '2023-01-01T00:00:00.000Z',
          },
        ],
        books: [],
        collections: [],
        'collection-book': [],
        goals: [],
      }

      await service.importLibrary(importData)
      expect(service['client']!.data.authors).toHaveLength(1)
      expect(service['client']!.data.authors[0].name).toBe('Imported Author')
    })
  })

  describe('external APIs', () => {
    it('should search Google Books', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            items: [{ id: '1', volumeInfo: { title: 'Test Book' } }],
          }),
      })

      const results = await service.searchGoogleBooks('test query')
      expect(results).toEqual({
        items: [{ id: '1', volumeInfo: { title: 'Test Book' } }],
      })
      expect(fetch).toHaveBeenCalledWith(
        'https://www.googleapis.com/books/v1/volumes?q=test%20query',
      )
    })

    it('should handle Google Books API errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(service.searchGoogleBooks('test')).rejects.toThrow(
        'Network error',
      )
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = useBookLibService()
      const instance2 = useBookLibService()

      expect(instance1).toBe(instance2)
    })
  })
})
