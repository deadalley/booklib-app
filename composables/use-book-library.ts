import { useBookLibService } from '~/services/data-management'
import type { Book } from '~/types/book'
import type { Author } from '~/types/author'
import type { Collection } from '~/types/collection'
import type { Goal } from '~/types/goal'
import type {
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
  LibraryIntegrityResult,
  Database,
} from '~/types/api'

export function useBookLibrary() {
  const service = useBookLibService()

  onMounted(async () => {
    await service.initialize()
  })

  const getAuthors = async (): Promise<Author[]> => {
    return await service.getAuthors()
  }

  const deleteAuthor = async (
    id: string,
    deleteBooks = false,
  ): Promise<string> => {
    return await service.deleteAuthor(id, { deleteBooks })
  }

  const getBook = async (id: string): Promise<Book | null> => {
    return await service.getBook(id)
  }

  const getBooks = async (
    params: GetBooksQuerySearchParams = {},
  ): Promise<Book[]> => {
    return await service.getBooks(params)
  }

  const createBook = async (book: Book): Promise<Book | null> => {
    return await service.createBook(book)
  }

  const deleteBook = async (id: string): Promise<string | null> => {
    return await service.deleteBook(id)
  }

  const deleteBooks = async (ids: string[]): Promise<string[]> => {
    return await service.deleteBooks(ids)
  }

  const getBookCount = async (): Promise<number> => {
    return await service.getBookCount()
  }

  const getLatestBooks = async (): Promise<Book[]> => {
    return await service.getLatestBooks()
  }

  const getOrderedBooks = async (
    params: GetOrderedBooksQuerySearchParams,
  ): Promise<Book[]> => {
    return await service.getOrderedBooks(params)
  }

  // Book Covers
  const getBookCover = async (id: string): Promise<string | null> => {
    return await service.getBookCover(id)
  }

  const updateBookCover = async (
    id: string,
    file: File,
  ): Promise<string | null> => {
    return await service.updateBookCover(id, file)
  }

  const deleteBookCover = async (id: string): Promise<void> => {
    return await service.deleteBookCover(id)
  }

  // Collections
  const getCollection = async (id: string): Promise<Collection | null> => {
    return await service.getCollection(id)
  }

  const getCollections = async (): Promise<Collection[]> => {
    return await service.getCollections()
  }

  const getCollectionCount = async (): Promise<number> => {
    return await service.getCollectionCount()
  }

  const createCollection = async (
    collection: Collection,
  ): Promise<Collection | null> => {
    return await service.createCollection(collection)
  }

  const deleteCollection = async (
    id: string,
    deleteBooks = false,
  ): Promise<string | null> => {
    return await service.deleteCollection(id, { deleteBooks })
  }

  const getGoals = async (): Promise<Goal[]> => {
    return await service.getGoals()
  }

  const createGoal = async (goal: Goal): Promise<Goal | null> => {
    return await service.createGoal(goal)
  }

  const isLibraryEmpty = async (): Promise<boolean> => {
    return await service.isLibraryEmpty()
  }

  const resetLibrary = async (): Promise<void> => {
    return await service.resetLibrary()
  }

  const checkLibraryIntegrity = async (): Promise<LibraryIntegrityResult> => {
    return await service.checkLibraryIntegrity()
  }

  const importLibrary = async (data: Database): Promise<void> => {
    return await service.importLibrary(data)
  }

  const exportLibrary = async (): Promise<Database> => {
    return await service.exportLibrary()
  }

  const searchGoogleBooks = async (query: string): Promise<unknown> => {
    return await service.searchGoogleBooks(query)
  }

  return {
    // Authors
    getAuthors,
    deleteAuthor,
    // Books
    getBook,
    getBooks,
    createBook,
    deleteBook,
    deleteBooks,
    getBookCount,
    getLatestBooks,
    getOrderedBooks,
    // Book Covers
    getBookCover,
    updateBookCover,
    deleteBookCover,
    // Collections
    getCollection,
    getCollections,
    getCollectionCount,
    createCollection,
    deleteCollection,
    // Goals
    getGoals,
    createGoal,
    // Library Management
    isLibraryEmpty,
    resetLibrary,
    checkLibraryIntegrity,
    importLibrary,
    exportLibrary,
    // External API
    searchGoogleBooks,
  }
}
