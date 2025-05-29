import type { H3Event, EventHandlerRequest } from 'h3'
import { Low, Memory } from 'lowdb'
import type { Database } from '~/types/api'
import { buildAuthor, DEFAULT_COLLECTIONS_INIT } from '~/utils'
import { LowDBClient } from './lowdb.service'

vi.mock('./file-storage.service', () => ({
  FileStorageService: vi.fn(() => ({
    getAllFileNames: vi.fn(() => Promise.resolve([])),
  })),
}))

function ids<T extends { id: string }>(items: T[]): string[] {
  return items.map(({ id }) => id)
}

function getDbSeed({
  authors,
  books,
  collectionBooks,
}: {
  authors: Database['authors']
  books: Database['books']
  collectionBooks: Database['collection-book']
}): Database {
  return {
    authors: [...authors],
    books: [...books],
    collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
      ...c,
      created_at: new Date().toISOString(),
    })),
    'collection-book': [...collectionBooks],
  }
}

describe('lowdb', async () => {
  const authors = [buildAuthor(), buildAuthor()]
  const books = [
    buildBook({ id: 'Book1', pages: 200, year: null }),
    buildBook({
      id: 'Book2',
      pages: 800,
      year: 2020,
      progress_status: 'reading',
    }),
    buildBook({
      id: 'Book3',
      pages: null,
      year: 1976,
      author_id: authors[1].id,
    }),
    buildBook({ id: 'Book4', pages: 80, year: 2025, author_id: authors[1].id }),
  ]
  const collectionBooks = [
    { collection_id: 'wishlist', book_id: books[0].id, order: 0 },
    { collection_id: 'favorite', book_id: books[0].id, order: 0 },
    { collection_id: 'favorite', book_id: books[1].id, order: 0 },
  ]

  const client = await new Low(
    new Memory<Database>(),
    getDbSeed({ authors, books, collectionBooks }),
  )

  const db = new LowDBClient(client)

  const event: H3Event<EventHandlerRequest> = {} as H3Event<EventHandlerRequest>

  beforeEach(async () => {
    client.data = getDbSeed({ authors, books, collectionBooks })
    await client.write()
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
        await db.deleteAuthor(event, authorId, {})
        expect(client.data.authors).toHaveLength(authors.length)
      })

      it('should delete author', async () => {
        const authorId = authors[0].id
        const result = await db.deleteAuthor(event, authorId, {})
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

        await db.deleteAuthor(event, authorId, {})

        const bookWithAuthorIdAfterDelete = client.data.books.find(
          (b) => b.author_id === authorId,
        )
        expect(bookWithAuthorIdAfterDelete).toBeUndefined()
      })

      it('should delete books from author if deleteBooks is true', async () => {
        const authorId = authors[1].id
        await db.deleteAuthor(event, authorId, {
          deleteBooks: true,
        })

        expect(client.data.books).toHaveLength(books.length - 1)
      })

      it('should not delete books from author if deleteBooks is false', async () => {
        const authorId = authors[1].id
        await db.deleteAuthor(event, authorId, {
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
        const result = await db.getBook(event, book.id)
        expect(result?.id).toEqual(book.id)
        expect(result?.title).toEqual(book.title)
      })

      it('should return book with collections', async () => {
        const book = books[0]
        const result = await db.getBook(event, book.id)
        expect(result?.collections).toEqual(['wishlist', 'favorite'])
      })

      it('should return null if book does not exist', async () => {
        const result = await db.getBook(event, 'non-existent-id')
        expect(result).toBeNull()
      })
    })

    describe('getBooks', async () => {
      it('should return all books', async () => {
        const result = await db.getBooks(event, {})
        expect(result).toHaveLength(books.length)
        expect(ids(result)).toEqual(ids(books))
      })

      it('should return books with pagination', async () => {
        const result = await db.getBooks(event, { page: 0, pageSize: 2 })
        expect(result).toHaveLength(2)
        expect(ids(result)).toEqual([books[0].id, books[1].id])
      })

      it('should filter books by progress status', async () => {
        const result = await db.getBooks(event, { bookProgress: 'reading' })
        expect(result).toHaveLength(1)
      })
    })

    describe('createBook', async () => {
      it('should create a new book', async () => {
        const newBook = buildBook({ id: 'new-book', title: 'New Book' })
        const result = await db.createBook(event, newBook, [])
        expect(result?.id).toBeDefined()
        expect(client.data.books).toHaveLength(books.length + 1)
      })

      it('should add book to collections if provided', async () => {
        const newBook = buildBook({ id: 'new-book', title: 'New Book' })
        const collectionIds = ['wishlist']
        const result = await db.createBook(event, newBook, collectionIds)

        expect(result?.id).toBeDefined()
        expect(client.data['collection-book']).toHaveLength(
          collectionBooks.length + 1,
        )
      })
    })

    describe('deleteBook', async () => {
      it('should delete book by id', async () => {
        const result = await db.deleteBook(event, books[0].id)

        expect(result).toBe(books[0].id)
        expect(client.data.books).toHaveLength(books.length - 1)
        expect(
          client.data.books.find((b) => b.id === books[0].id),
        ).toBeUndefined()
      })
    })

    describe('orderedBooks', async () => {
      it('should return books ordered by pages in ascending order', async () => {
        const result = await db.getOrderedBooks(event, {
          property: 'pages',
        })
        expect(ids(result)).toEqual([books[3].id, books[0].id, books[1].id])
      })

      it('should return books ordered by year in ascending order', async () => {
        const result = await db.getOrderedBooks(event, {
          property: 'year',
        })
        expect(ids(result)).toEqual([books[2].id, books[1].id, books[3].id])
      })

      it('should return correct amount of books when count is defined', async () => {
        const result = await db.getOrderedBooks(event, {
          property: 'pages',
          count: 2,
        })
        expect(ids(result)).toEqual([books[3].id, books[0].id])
      })
    })
  })
})
