import { Low, Memory } from 'lowdb'
import type { Database } from '~/types/api'
import { buildAuthor } from '~/utils'
import { LowDBClient } from './lowdb.service'
import type { ServerFile } from 'nuxt-file-storage'
import { getDbSeed } from './db.service'

// Use vi.hoisted() to ensure these are available during mock setup
const { getAllFileNamesMock, getFileMock, saveFileMock, deleteFileMock } =
  vi.hoisted(() => ({
    getAllFileNamesMock: vi.fn(() =>
      Promise.resolve(['Book1.jpg', 'Book2.jpg']),
    ),
    getFileMock: vi.fn(() => Promise.resolve('')),
    saveFileMock: vi.fn(() => Promise.resolve('')),
    deleteFileMock: vi.fn(() => Promise.resolve('')),
  }))

vi.mock('./file-storage.service', () => ({
  FileStorageService: vi.fn(() => ({
    getAllFileNames: getAllFileNamesMock,
    getFile: getFileMock,
    saveFile: saveFileMock,
    deleteFile: deleteFileMock,
  })),
}))

function ids<T extends { id: string }>(items: T[]): string[] {
  return items.map(({ id }) => id)
}

describe('lowdb', async () => {
  const authors = [buildAuthor(), buildAuthor()]
  const books = [
    buildBook({
      id: 'Book1',
      title: 'Book1',
      pages: 200,
      year: null,
      author_id: null,
      created_at: '2024-01-01T00:00:00Z',
    }),
    buildBook({
      id: 'Book2',
      title: 'Book2',
      pages: 800,
      year: 2020,
      author_id: null,
      progress_status: 'reading',
      created_at: '2023-01-02T00:00:00Z',
    }),
    buildBook({
      id: 'Book3',
      title: 'Book3',
      pages: null,
      year: 1976,
      author_id: authors[1].id,
      created_at: '2024-01-02T00:00:00Z',
    }),
    buildBook({
      id: 'Book4',
      title: 'Book4',
      pages: 80,
      year: 2025,
      author_id: authors[1].id,
      created_at: '2020-01-02T00:00:00Z',
    }),
  ]
  const collections = [
    buildCollection({ id: 'Collection1', name: 'Collection1' }),
  ]
  const collectionBooks = [
    { collection_id: 'wishlist', book_id: books[0].id, order: 0 },
    { collection_id: 'favorite', book_id: books[0].id, order: 0 },
    { collection_id: 'favorite', book_id: books[1].id, order: 0 },
    { collection_id: collections[0].id, book_id: books[2].id, order: 0 },
  ]

  const client = await new Low(
    new Memory<Database>(),
    getDbSeed({ authors, books, collections, collectionBooks }),
  )

  const db = new LowDBClient(client)

  beforeEach(async () => {
    client.data = getDbSeed({ authors, books, collections, collectionBooks })
    await client.write()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  describe('authors', async () => {
    describe('getAuthors', async () => {
      it('should return an array of authors', async () => {
        const result = await db.getAuthors()
        expect(result).toEqual(authors)
      })
    })

    describe('deleteAuthor', async () => {
      it('should not delete author if author does not exist', async () => {
        const authorId = 'non-existent-id'
        await db.deleteAuthor(authorId, {})
        expect(client.data.authors).toHaveLength(authors.length)
      })

      it('should delete author', async () => {
        const authorId = authors[0].id
        const result = await db.deleteAuthor(authorId, {})
        expect(result).toBe(authorId)

        expect(client.data.authors).toHaveLength(authors.length - 1)
        expect(
          client.data.authors.find((a) => a.id === authorId),
        ).toBeUndefined()
      })

      it('should remove author id from books', async () => {
        const authorId = authors[1].id
        const bookWithAuthorId = client.data.books.find(
          (b) => b.author_id === authorId,
        )
        expect(bookWithAuthorId).toBeDefined()

        await db.deleteAuthor(authorId, {})

        const bookWithAuthorIdAfterDelete = client.data.books.find(
          (b) => b.author_id === authorId,
        )
        expect(bookWithAuthorIdAfterDelete).toBeUndefined()
      })

      it('should delete books from author if deleteBooks is true', async () => {
        const authorId = authors[1].id
        await db.deleteAuthor(authorId, {
          deleteBooks: true,
        })

        expect(client.data.books).toHaveLength(books.length - 2)
      })

      it('should not delete books from author if deleteBooks is false', async () => {
        const authorId = authors[1].id
        await db.deleteAuthor(authorId, {
          deleteBooks: false,
        })
        expect(client.data.books).toHaveLength(books.length)
      })
    })
  })

  describe('books', async () => {
    describe('getBook', async () => {
      it('should return book by id', async () => {
        const book = books[0]
        const result = await db.getBook(book.id)
        expect(result?.id).toEqual(book.id)
        expect(result?.title).toEqual(book.title)
      })

      it('should return book with collections', async () => {
        const book = books[0]
        const result = await db.getBook(book.id)
        expect(result?.collections).toEqual(['wishlist', 'favorite'])
      })

      it('should return null if book does not exist', async () => {
        const result = await db.getBook('non-existent-id')
        expect(result).toBeNull()
      })

      it('should return cover src if exists', async () => {
        getFileMock.mockResolvedValueOnce('Book1.jpg')
        const result = await db.getBook(books[0].id)
        expect(result?.cover_src).toBeDefined()
        expect(result?.cover_src).toContain('/api/books/Book1/cover')
      })

      it('should return null if cover does not exist', async () => {
        const result = await db.getBook(books[2].id)
        expect(result?.cover_src).toBeNull()
      })
    })

    describe('getBooks', async () => {
      it('should return all books', async () => {
        const result = await db.getBooks({})
        expect(result).toHaveLength(books.length)
        expect(ids(result)).toEqual(ids(books))
      })

      it('should return books with pagination', async () => {
        const result = await db.getBooks({ page: 0, pageSize: 2 })
        expect(result).toHaveLength(2)
        expect(ids(result)).toEqual([books[0].id, books[1].id])
      })

      it('should filter books by progress status', async () => {
        const result = await db.getBooks({ bookProgress: 'reading' })
        expect(result).toHaveLength(1)
      })
    })

    describe('createBook', async () => {
      it('should create a new book', async () => {
        const newBook = buildBook({ id: 'new-book', title: 'New Book' })
        const result = await db.createBook(newBook, [])
        expect(result?.id).toBeDefined()
        expect(client.data.books).toHaveLength(books.length + 1)
      })

      it('should add book to collections if provided', async () => {
        const newBook = buildBook({ id: 'new-book', title: 'New Book' })
        const collectionIds = ['wishlist']
        const result = await db.createBook(newBook, collectionIds)

        expect(result?.id).toBeDefined()
        expect(client.data['collection-book']).toHaveLength(
          collectionBooks.length + 1,
        )
      })

      it('should create author with book when none exists', async () => {
        const newBook = buildBook({
          id: 'new-book',
          title: 'New Book',
          author_id: 'New Author',
        })

        await db.createBook(newBook, [])

        expect(client.data.books).toHaveLength(books.length + 1)
        expect(client.data.authors).toHaveLength(authors.length + 1)
      })

      it('should not create author if author already exists', async () => {
        const newBook = buildBook({
          id: 'new-book',
          title: 'New Book',
          author_id: authors[0].id,
        })

        await db.createBook(newBook, [])

        expect(client.data.books).toHaveLength(books.length + 1)
        expect(client.data.authors).toHaveLength(authors.length)
      })

      it('should update book if it already exists', async () => {
        const updatedBook = {
          ...books[0],
          title: 'Updated Book',
          author_id: authors[0].id,
        }

        await db.createBook(updatedBook, [])

        const book = client.data.books.find((b) => b.id === updatedBook.id)
        expect(book?.id).toBe(updatedBook.id)
        expect(book?.title).toBe('Updated Book')
        expect(book?.author_id).toBe(authors[0].id)
        expect(client.data.books).toHaveLength(books.length)
      })

      it('should correctly update collections', async () => {
        await db.createBook(books[0], [collections[0].id])

        const bookCollections = client.data['collection-book'].filter(
          ({ book_id }) => book_id === books[0].id,
        )
        expect(bookCollections).toHaveLength(1)
        expect(bookCollections[0].collection_id).toBe(collections[0].id)
      })
    })

    describe('deleteBook', async () => {
      it('should delete book by id', async () => {
        const result = await db.deleteBook(books[0].id)

        expect(result).toBe(books[0].id)
        expect(client.data.books).toHaveLength(books.length - 1)
        expect(
          client.data.books.find((b) => b.id === books[0].id),
        ).toBeUndefined()
      })
    })

    describe('deleteBooks', async () => {
      it('should delete all books and remove from collections', async () => {
        const bookIds = [books[0].id, books[2].id, books[3].id]
        const result = await db.deleteBooks(bookIds)

        expect(result).toEqual(bookIds)
        expect(client.data.books).toHaveLength(books.length - bookIds.length)
        expect(
          client.data.books.find((b) => bookIds.includes(b.id)),
        ).toBeUndefined()
        expect(client.data['collection-book']).toHaveLength(1)
      })
    })

    describe('getBookCount', async () => {
      it('should return total book count', async () => {
        const result = await db.getBookCount()
        expect(result).toBe(books.length)
      })

      it('should return null if no books exist', async () => {
        client.data.books = []
        await client.write()
        const result = await db.getBookCount()
        expect(result).toBe(0)
      })
    })

    describe('getLatestBooks', async () => {
      it('should return books ordered by created at', async () => {
        const newBooks = [
          buildBook({ created_at: '2024-01-03T00:00:00Z' }),
          buildBook({ created_at: '2024-01-13T00:00:00Z' }),
          buildBook({ created_at: '2024-01-30T00:00:00Z' }),
          buildBook({ created_at: '2024-01-24T00:00:00Z' }),
          buildBook({ created_at: '2024-01-11T00:00:00Z' }),
          buildBook({ created_at: '2024-01-18T00:00:00Z' }),
          buildBook({ created_at: '2024-01-28T00:00:00Z' }),
          buildBook({ created_at: '2024-01-20T00:00:00Z' }),
          buildBook({ created_at: '2024-01-02T00:00:00Z' }),
          buildBook({ created_at: '2024-01-12T00:00:00Z' }),
          buildBook({ created_at: '2024-01-12T00:00:00Z' }),
          buildBook({ created_at: '2024-01-29T00:00:00Z' }),
        ]

        client.data.books = newBooks

        const expected = [
          newBooks[2].created_at,
          newBooks[11].created_at,
          newBooks[6].created_at,
          newBooks[3].created_at,
          newBooks[7].created_at,
          newBooks[5].created_at,
          newBooks[1].created_at,
          newBooks[9].created_at,
          newBooks[10].created_at,
          newBooks[4].created_at,
        ]

        const result = await db.getLatestBooks()
        expect(result).toHaveLength(10)
        expect(result.map(({ created_at }) => created_at)).toEqual(expected)
      })
    })

    describe('orderedBooks', async () => {
      it('should return books ordered by pages in ascending order', async () => {
        const result = await db.getOrderedBooks({
          property: 'pages',
        })
        expect(ids(result)).toEqual([books[3].id, books[0].id, books[1].id])
      })

      it('should return books ordered by year in ascending order', async () => {
        const result = await db.getOrderedBooks({
          property: 'year',
        })
        expect(ids(result)).toEqual([books[2].id, books[1].id, books[3].id])
      })

      it('should return correct amount of books when count is defined', async () => {
        const result = await db.getOrderedBooks({
          property: 'pages',
          count: 2,
        })
        expect(ids(result)).toEqual([books[3].id, books[0].id])
      })
    })
  })

  describe('book covers', async () => {
    describe('getBookCover', async () => {
      it.skip('should return book cover', async () => {
        getFileMock.mockResolvedValueOnce('Book1.jpg')
        const result = await db.getBookCover(books[0].id)
        expect(result).toBeDefined()
      })

      it('should return undefined if book cover does not exist', async () => {
        const result = await db.getBookCover('non-existent-id')
        expect(result).toBeNull()
      })
    })

    describe('updateBookCover', async () => {
      const file = {} as unknown as ServerFile

      it('should create book cover if it does not exist', async () => {
        await db.updateBookCover(books[2].id, file)
        expect(deleteFileMock).not.toHaveBeenCalled()
        expect(saveFileMock).toHaveBeenCalledWith(books[2].id, file)
      })

      it('should delete and create book cover if it exists', async () => {
        await db.updateBookCover(books[0].id, file)
        expect(deleteFileMock).toHaveBeenCalledWith('Book1.jpg')
        expect(saveFileMock).toHaveBeenCalledWith(books[0].id, file)
      })

      it('returns the book cover url', async () => {
        const result = await db.updateBookCover(books[2].id, file)
        expect(result).toContain('/api/books/Book3/cover')
      })
    })

    describe('deleteBookCover', async () => {
      it('should delete book cover', async () => {
        const result = await db.deleteBookCover(books[0].id)
        expect(result).toBeNull()
      })

      it('should throw error if book cover does not exist', async () => {
        await expect(db.deleteBookCover('non-existent-id')).rejects.toThrow(
          'Book cover not found for non-existent-id to delete',
        )
      })
    })
  })

  describe('collections', async () => {
    describe('getCollection', async () => {
      it('should return collection by id', async () => {
        const result = await db.getCollection('wishlist')
        expect(result?.id).toBe('wishlist')
      })

      it('should return null if collection does not exist', async () => {
        const result = await db.getCollection('non-existent-id')
        expect(result).toBeNull()
      })
    })

    describe('getCollections', async () => {
      it('should return all collections', async () => {
        const result = await db.getCollections()
        expect(result).toHaveLength(3)
      })
    })

    describe('getCollectionCount', async () => {
      it('should return total collection count', async () => {
        const result = await db.getCollectionCount()
        expect(result).toBe(3)
      })
    })

    describe('createCollection', async () => {
      it('should create a new collection', async () => {
        const newCollection = buildCollection({
          id: 'new-collection',
          name: 'New Collection',
        })
        const result = await db.createCollection(newCollection, [])
        expect(result?.id).toBeDefined()
        expect(client.data.collections).toHaveLength(4)
      })

      it('should add books to collection if provided', async () => {
        const newCollection = buildCollection({
          id: 'new-collection',
          name: 'New Collection',
        })
        const result = await db.createCollection(newCollection, [
          { id: books[0].id, order: 0 },
          { id: books[1].id, order: 1 },
        ])

        expect(result?.id).toBeDefined()
        expect(client.data['collection-book']).toHaveLength(
          collectionBooks.length + 2,
        )
      })

      it('should update collection if it already exists', async () => {
        const updatedCollection = {
          ...collections[0],
          name: 'Updated Collection',
        }

        await db.createCollection(updatedCollection, [])

        const collection = client.data.collections.find(
          (b) => b.id === updatedCollection.id,
        )
        expect(collection?.id).toBe(updatedCollection.id)
        expect(collection?.name).toBe('Updated Collection')
        expect(client.data.collections).toHaveLength(3)
      })

      it('should correctly update collection books', async () => {
        await db.createCollection(collections[0], [
          { id: books[0].id, order: 1 },
        ])

        const bookCollections = client.data['collection-book'].filter(
          ({ collection_id }) => collection_id === collections[0].id,
        )
        expect(bookCollections).toHaveLength(1)
        expect(bookCollections[0].book_id).toBe(books[0].id)
      })
    })

    describe('deleteCollection', async () => {
      it('should delete collection by id', async () => {
        const result = await db.deleteCollection(collections[0].id, {})
        expect(result).toBe(collections[0].id)
        expect(client.data.collections).toHaveLength(2)
        expect(client.data['collection-book']).toHaveLength(3)
      })

      it('should delete books if deleteBooks is true', async () => {
        await db.deleteCollection(collections[0].id, {
          deleteBooks: true,
        })
        expect(client.data.books).toHaveLength(books.length - 1)
      })

      it('should not delete books if deleteBooks is false', async () => {
        await db.deleteCollection(collections[0].id, {
          deleteBooks: false,
        })
        expect(client.data.books).toHaveLength(books.length)
      })

      it('should not delete collection if it does not exist', async () => {
        const result = await db.deleteCollection('non-existent-id', {})
        expect(result).toBe('non-existent-id')
        expect(client.data.collections).toHaveLength(3)
      })

      it('should not delete wishlist', async () => {
        await expect(db.deleteCollection('wishlist', {})).rejects.toThrow(
          'Cannot delete wishlist',
        )
        expect(client.data.collections).toHaveLength(3)
      })

      it('should not delete favorite', async () => {
        await expect(db.deleteCollection('favorite', {})).rejects.toThrow(
          'Cannot delete favorite',
        )
        expect(client.data.collections).toHaveLength(3)
      })
    })
  })

  describe('library', async () => {
    describe('isLibraryEmpty', async () => {
      it('should return false if library is not empty', async () => {
        const result = await db.isLibraryEmpty()
        expect(result).toBe(false)
      })

      it('should return true if library is empty', async () => {
        client.data = getDbSeed({
          authors: [],
          books: [],
          collections: [],
          collectionBooks: [],
        })
        await client.write()
        const result = await db.isLibraryEmpty()
        expect(result).toBe(true)
      })
    })

    describe('resetLibrary', async () => {
      it('should reset library to initial state', async () => {
        await db.resetLibrary()
        expect(client.data.authors).toHaveLength(0)
        expect(client.data.books).toHaveLength(0)
        expect(client.data.collections).toHaveLength(2)
        expect(client.data['collection-book']).toHaveLength(0)
      })
    })

    describe('importLibrary', async () => {
      it('should import books into library', async () => {
        const newBooks = [
          buildBook({ id: 'imported-book-1', title: 'Imported Book 1' }),
          buildBook({ id: 'imported-book-2', title: 'Imported Book 2' }),
        ]
        const result = await db.importLibrary(newBooks)
        expect(result).toBe(true)
        expect(client.data.books).toHaveLength(books.length + newBooks.length)
      })
    })

    describe('checkLibraryIntegrity', async () => {
      it('should return no errors if library is consistent', async () => {
        const result = await db.checkLibraryIntegrity()
        expect(result).toEqual({
          authors: [],
          books: [],
          collections: [],
          goals: [],
        })
      })

      it('should return errors', async () => {
        client.data = getDbSeed({
          authors,
          books: books.concat([
            buildBook({
              id: 'Book5',
              title: 'Book5',
              author_id: 'non-existent',
            }),
          ]),
          collections,
          collectionBooks: [
            { collection_id: 'non-existent', book_id: books[0].id, order: 0 },
            {
              collection_id: collections[0].id,
              book_id: 'non-existent',
              order: 0,
            },
          ],
        })
        await client.write()
        const result = await db.checkLibraryIntegrity()
        expect(result).toEqual({
          authors: [],
          books: [
            'Book Book1 is assigned collection non-existent, which does not exist.',
            'Book Book5 is assigned author non-existent, which does not exist.',
          ],
          collections: [
            'Collection Collection1 contains book non-existent, which does not exist',
          ],
          goals: [],
        })
      })
    })
  })
})
