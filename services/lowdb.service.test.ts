import type { H3Event, EventHandlerRequest } from 'h3'
import { Low, Memory } from 'lowdb'
import type { Database } from '~/types/api'
import { buildAuthor, DEFAULT_COLLECTIONS_INIT } from '~/utils'
import { LowDBClient } from './lowdb.service'

describe('lowdb', async () => {
  const authors = [buildAuthor(), buildAuthor()]
  const books = [
    buildBook(),
    buildBook(),
    buildBook({ author_id: authors[1].id }),
  ]

  const seed: Database = {
    authors,
    books,
    collections: DEFAULT_COLLECTIONS_INIT.map((c) => ({
      ...c,
      created_at: new Date().toISOString(),
    })),
    'collection-book': [
      { collection_id: 'wishlist', book_id: books[0].id, order: 0 },
      { collection_id: 'favorite', book_id: books[0].id, order: 0 },
      { collection_id: 'favorite', book_id: books[1].id, order: 0 },
    ],
  }

  const client = await new Low(new Memory<Database>(), seed)

  const db = new LowDBClient(client)

  const event: H3Event<EventHandlerRequest> = {} as H3Event<EventHandlerRequest>

  beforeEach(async () => {
    client.data = { ...seed }
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
})
