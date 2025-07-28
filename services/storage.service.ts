import type {
  Database,
  DeleteAuthorParams,
  DeleteCollectionParams,
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
  LibraryIntegrityResult,
} from '~/types/api'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from '~/types/database'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import type { DatabaseClient } from './database-client'
import { createDatabaseClient } from './database-client'
import { v4 as uuidv4 } from 'uuid'
import {
  logger,
  DEFAULT_COLLECTIONS_INIT,
  now,
  dbBookToBook,
  bookToDbBook,
  dbAuthorToAuthor,
  dbCollectionToCollection,
  dbGoalToGoal,
  goalToDbGoal,
} from '../utils'

export class StorageService {
  private client: DatabaseClient | null = null
  private dbPath: string | null = null
  private isInitialized = false

  constructor(dbPath?: string) {
    if (dbPath) {
      this.dbPath = dbPath
    }
  }

  private async getDefaultDbPath(): Promise<string> {
    // For Electron app, use app data directory
    if (import.meta.client && 'electronAPI' in window) {
      return window.electronAPI.getDbPath()
    }
    // For Node.js environment (local development), use a local file
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      return './booklib-data.json'
    }
    // For web app, use localStorage fallback (this path won't be used but needed for consistency)
    return 'booklib-data.json'
  }

  private getDbSeed({
    authors = [],
    books = [],
    collections = [],
    collectionBooks = [],
  }: {
    authors?: Database['authors']
    books?: Database['books']
    collections?: Database['collections']
    collectionBooks?: Database['collection-book']
  }): Database {
    return {
      authors: [...authors],
      books: [...books],
      collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
        ...c,
        created_at: now(),
      })).concat(collections),
      'collection-book': [...collectionBooks],
      goals: [],
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Set dbPath if not already set
      if (!this.dbPath) {
        this.dbPath = await this.getDefaultDbPath()
      }

      // Create unified database client that handles both Electron and web environments
      this.client = await createDatabaseClient(this.dbPath, this.getDbSeed({}))

      this.isInitialized = true
    } catch (error) {
      logger.error('Failed to initialize database:', error)
      throw error
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  private isBookCover(id: BookDB['id']) {
    return (fileName: string) => fileName.split('.')[0] === id
  }

  private async getBookCoverFileName(
    _id: BookDB['id'],
  ): Promise<string | undefined> {
    // Implementation depends on how book covers are stored in client-side
    // This would need to be adapted based on your file storage strategy
    return undefined
  }

  private getBookCoverUrl(id: BookDB['id']): string {
    return `/book-covers/${id}`
  }

  // Authors
  async getAuthors(): Promise<Author[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()
    const data = this.client.data.authors
    return data.map(dbAuthorToAuthor)
  }

  async deleteAuthor(
    id: AuthorDB['id'],
    params: DeleteAuthorParams,
  ): Promise<AuthorDB['id']> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    this.client.data.authors = this.client.data.authors.filter(
      (author) => author.id !== id,
    )

    if (params.deleteBooks) {
      this.client.data.books = this.client.data.books.filter((book) => {
        if (book.author_id === id) {
          // Handle book cover deletion in client-side context
          this.deleteBookCover(book.id)
        }
        return book.author_id !== id
      })
    } else {
      this.client.data.books = this.client.data.books.map((book) =>
        book.author_id === id ? { ...book, author_id: null } : book,
      )
    }

    await this.client.write()
    return id
  }

  // Books
  async getBook(id: BookDB['id']): Promise<Book | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const book = this.client.data.books.find((book) => book.id === id)
    if (!book) return null

    const collections = this.client.data['collection-book']
      .filter(({ book_id }) => book_id === id)
      .map(({ collection_id }) =>
        this.client!.data.collections.find(({ id }) => id === collection_id),
      )
      .filter(Boolean) as CollectionDB[]

    return dbBookToBook(
      book,
      collections.map((c) => c.id),
    )
  }

  async getBooks(params: GetBooksQuerySearchParams): Promise<Book[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    let books = [...this.client.data.books]

    // Apply filters
    if (params.bookProgress) {
      books = books.filter(
        (book) => book.progress_status === params.bookProgress,
      )
    }

    // Apply pagination
    if (params.page !== undefined && params.pageSize !== undefined) {
      const start = (params.page - 1) * params.pageSize
      const end = start + params.pageSize
      books = books.slice(start, end)
    }

    // Map to Book objects with collections
    return books.map((book) => {
      const collections = this.client!.data['collection-book'].filter(
        ({ book_id }) => book_id === book.id,
      )
        .map(({ collection_id }) =>
          this.client!.data.collections.find(({ id }) => id === collection_id),
        )
        .filter(Boolean) as CollectionDB[]

      return dbBookToBook(
        book,
        collections.map((c) => c.id),
      )
    })
  }

  async createBook(book: Book): Promise<Book | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    const bookDb: BookDB = {
      ...bookToDbBook(book),
      id: book.id ?? uuidv4(),
      author_id: book.author || null,
      created_at: book.createdAt || now(),
    }

    const collections = book.collections

    this.client.read()

    // Add book
    this.client.data.books.push(bookDb)

    // Add collection relationships
    collections.forEach((collectionId, index) => {
      this.client!.data['collection-book'].push({
        book_id: bookDb.id,
        collection_id: collectionId,
        order: index,
      })
    })

    await this.client.write()

    return this.getBook(bookDb.id)
  }

  async deleteBook(id: BookDB['id']): Promise<BookDB['id'] | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const bookExists = this.client.data.books.some((book) => book.id === id)
    if (!bookExists) return null

    // Remove book
    this.client.data.books = this.client.data.books.filter(
      (book) => book.id !== id,
    )

    // Remove collection relationships
    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => book_id !== id)

    // Delete book cover
    await this.deleteBookCover(id)

    await this.client.write()
    return id
  }

  async deleteBooks(ids: BookDB['id'][]): Promise<BookDB['id'][]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const deletedIds: BookDB['id'][] = []

    ids.forEach((id) => {
      const bookExists = this.client!.data.books.some((book) => book.id === id)
      if (bookExists) {
        deletedIds.push(id)
        // Delete book cover
        this.deleteBookCover(id)
      }
    })

    // Remove books
    this.client.data.books = this.client.data.books.filter(
      (book) => !ids.includes(book.id),
    )

    // Remove collection relationships
    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => !ids.includes(book_id))

    await this.client.write()
    return deletedIds
  }

  async getBookCount(): Promise<number> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()
    return this.client.data.books.length
  }

  async getLatestBooks(): Promise<Book[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const books = [...this.client.data.books]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10)

    return books.map((book) => {
      const collections = this.client!.data['collection-book'].filter(
        ({ book_id }) => book_id === book.id,
      )
        .map(({ collection_id }) =>
          this.client!.data.collections.find(({ id }) => id === collection_id),
        )
        .filter(Boolean) as CollectionDB[]

      return dbBookToBook(
        book,
        collections.map((c) => c.id),
      )
    })
  }

  async getOrderedBooks(
    params: GetOrderedBooksQuerySearchParams,
  ): Promise<Book[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const books = [...this.client.data.books]
      .filter((book) => book[params.property] != null)
      .sort((a, b) => {
        const aVal = a[params.property] as number
        const bVal = b[params.property] as number
        return bVal - aVal
      })
      .slice(0, params.count || 10)

    return books.map((book) => {
      const collections = this.client!.data['collection-book'].filter(
        ({ book_id }) => book_id === book.id,
      )
        .map(({ collection_id }) =>
          this.client!.data.collections.find(({ id }) => id === collection_id),
        )
        .filter(Boolean) as CollectionDB[]

      return dbBookToBook(
        book,
        collections.map((c) => c.id),
      )
    })
  }

  // Book Covers
  async getBookCover(_id: BookDB['id']): Promise<string | null> {
    // This would need to be implemented based on your client-side file storage strategy
    // For now, return null
    return null
  }

  async updateBookCover(
    _id: BookDB['id'],
    _file: File,
  ): Promise<string | null> {
    // This would need to be implemented based on your client-side file storage strategy
    // For now, return null
    return null
  }

  async deleteBookCover(_id: BookDB['id']): Promise<void> {
    // This would need to be implemented based on your client-side file storage strategy
  }

  // Collections
  async getCollection(id: CollectionDB['id']): Promise<Collection | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const collection = this.client.data.collections.find((c) => c.id === id)
    if (!collection) return null

    const collectionBooks = this.client.data['collection-book'].filter(
      ({ collection_id }) => collection_id === id,
    )

    return dbCollectionToCollection(collection, collectionBooks)
  }

  async getCollections(): Promise<Collection[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    return this.client.data.collections.map((collection) => {
      const collectionBooks = this.client!.data['collection-book'].filter(
        ({ collection_id }) => collection_id === collection.id,
      )

      return dbCollectionToCollection(collection, collectionBooks)
    })
  }

  async getCollectionCount(): Promise<number> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()
    return this.client.data.collections.length
  }

  async createCollection(collection: Collection): Promise<Collection | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    const collectionDb: CollectionDB = {
      id: collection.id ?? uuidv4(),
      name: collection.name,
      created_at: collection.createdAt || now(),
    }

    this.client.read()

    // Add collection
    this.client.data.collections.push(collectionDb)

    // Add book relationships
    collection.books.forEach((book, index) => {
      this.client!.data['collection-book'].push({
        book_id: book.id,
        collection_id: collectionDb.id,
        order: book.order ?? index,
      })
    })

    await this.client.write()

    return this.getCollection(collectionDb.id)
  }

  async deleteCollection(
    id: CollectionDB['id'],
    params: DeleteCollectionParams,
  ): Promise<CollectionDB['id'] | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const collectionExists = this.client.data.collections.some(
      (c) => c.id === id,
    )
    if (!collectionExists) return null

    // Get books in this collection
    const booksInCollection = this.client.data['collection-book']
      .filter(({ collection_id }) => collection_id === id)
      .map(({ book_id }) => book_id)

    if (params.deleteBooks) {
      // Delete books in this collection
      await this.deleteBooks(booksInCollection)
    }

    // Remove collection
    this.client.data.collections = this.client.data.collections.filter(
      (c) => c.id !== id,
    )

    // Remove collection relationships
    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ collection_id }) => collection_id !== id)

    await this.client.write()
    return id
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()
    return this.client.data.goals.map(dbGoalToGoal)
  }

  async createGoal(goal: Goal): Promise<Goal | null> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    const goalDb: GoalDB = {
      ...goalToDbGoal(goal),
      id: goal.id ?? uuidv4(),
      created_at: goal.createdAt || now(),
    }

    this.client.read()
    this.client.data.goals.push(goalDb)
    await this.client.write()

    const createdGoal = this.client.data.goals.find((g) => g.id === goalDb.id)
    return createdGoal ? dbGoalToGoal(createdGoal) : null
  }

  // Library Management
  async isLibraryEmpty(): Promise<boolean> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()
    return this.client.data.books.length === 0
  }

  async resetLibrary(): Promise<void> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.data = this.getDbSeed({})
    await this.client.write()
  }

  async checkLibraryIntegrity(): Promise<LibraryIntegrityResult> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.read()

    const result: LibraryIntegrityResult = {
      books: [],
      collections: [],
      authors: [],
    }

    // Check for orphaned collection-book relationships
    this.client.data['collection-book'].forEach(
      ({ book_id, collection_id }) => {
        const bookExists = this.client!.data.books.some((b) => b.id === book_id)
        const collectionExists = this.client!.data.collections.some(
          (c) => c.id === collection_id,
        )

        if (!bookExists) {
          result.books.push(
            `Book ${book_id} referenced in collection-book but doesn't exist`,
          )
        }
        if (!collectionExists) {
          result.collections.push(
            `Collection ${collection_id} referenced in collection-book but doesn't exist`,
          )
        }
      },
    )

    // Check for orphaned author references
    this.client.data.books.forEach((book) => {
      if (book.author_id) {
        const authorExists = this.client!.data.authors.some(
          (a) => a.id === book.author_id,
        )
        if (!authorExists) {
          result.authors.push(
            `Author ${book.author_id} referenced in book ${book.id} but doesn't exist`,
          )
        }
      }
    })

    return result
  }

  async importLibrary(data: Database): Promise<void> {
    await this.ensureInitialized()
    if (!this.client) throw new Error('Database not initialized')

    this.client.data = data
    await this.client.write()
  }

  // External API (Google Books)
  async searchGoogleBooks(query: string): Promise<unknown> {
    // This would need to be implemented using client-side fetch
    // Since Google Books API can be called directly from the client
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`,
      )
      return await response.json()
    } catch (error) {
      logger.error('Failed to search Google Books:', error)
      throw error
    }
  }
}

// Create a singleton instance
let storageService: StorageService | null = null

export function useBookLibService(): StorageService {
  if (!storageService) {
    storageService = new StorageService()
  }
  return storageService
}
