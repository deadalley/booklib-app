import type { H3Event, EventHandlerRequest } from 'h3'
import type {
  Database,
  DBClient,
  DeleteAuthorParams,
  DeleteCollectionParams,
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
} from '~/types/api'
import type { Low } from 'lowdb'
import type { AuthorDB, BookDB, CollectionDB } from '~/types/database'
import type { Book } from '~/types/book'
import { v4 as uuidv4 } from 'uuid'
import { bookToDbBook, logger, DEFAULT_COLLECTIONS } from '../utils'
import type { ServerFile } from 'nuxt-file-storage'
import { createReadStream } from 'fs'
import { difference } from 'ramda'
import { FileStorageService } from './file-storage.service'
import type { Collection } from '~/types/collection'

export class LowDBClient {
  private client: Low<Database>
  private fileStorage: FileStorageService

  constructor(client: Low<Database>) {
    this.client = client
    this.fileStorage = new FileStorageService('/bookCovers')
  }

  private isBookCover(id: BookDB['id']) {
    return (fileName: string) => fileName.split('.')[0] === id
  }

  private async getBookCoverFileName(id: BookDB['id']) {
    const allFiles = await this.fileStorage.getAllFileNames()

    // find the file extension
    const fileName = allFiles.find(this.isBookCover(id))

    return fileName
  }

  private getBookCoverUrl(id: BookDB['id']) {
    return `${process.env.VITE_DEV_SERVER_URL}/api/books/${id}/cover`
  }

  async getAuthors(): ReturnType<DBClient['getAuthors']> {
    await this.client.read()

    const data = this.client.data.authors

    return data
  }

  async deleteAuthor(
    event: H3Event<EventHandlerRequest>,
    id: AuthorDB['id'],
    params: DeleteAuthorParams,
  ): ReturnType<DBClient['deleteAuthor']> {
    await this.client.read()

    this.client.data.authors = this.client.data.authors.filter(
      (author) => author.id !== id,
    )

    if (params.deleteBooks) {
      this.client.data.books = this.client.data.books.filter(
        (book) => book.author_id !== id,
      )
    } else {
      this.client.data.books = this.client.data.books.map((book) =>
        book.author_id === id ? { ...book, author_id: null } : book,
      )
    }

    await this.client.write()

    return id
  }

  async getBook(
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ): ReturnType<DBClient['getBook']> {
    await this.client.read()

    const book = this.client.data.books.find((book) => book.id === id)

    const bookCovers = await this.fileStorage.getAllFileNames()
    const hasBookCover = book?.id && bookCovers.find(this.isBookCover(book.id))

    const collections = this.client.data['collection-book']
      .filter(({ book_id }) => book_id === id)
      .map(({ collection_id }) => collection_id)

    return book
      ? {
          ...book,
          collections,
          cover_src: hasBookCover ? this.getBookCoverUrl(book.id) : null,
        }
      : null
  }

  async getBooks(
    event: H3Event<EventHandlerRequest>,
    { page, pageSize, bookProgress }: GetBooksQuerySearchParams,
  ): ReturnType<DBClient['getBooks']> {
    await this.client.read()

    let data = this.client.data.books

    if (page !== undefined && pageSize !== undefined) {
      data = data.slice(page * pageSize, (page + 1) * pageSize)
    }

    if (bookProgress !== undefined) {
      data = data.filter((book) => book.progress_status === bookProgress)
    }

    const bookCovers = await this.fileStorage.getAllFileNames()

    data = data.map((book) => {
      const hasBookCover = bookCovers.find(this.isBookCover(book.id))

      const collections = this.client.data['collection-book']
        .filter(({ book_id }) => book_id === book.id)
        .map(({ collection_id }) => collection_id)

      return {
        ...book,
        collections,
        cover_src: hasBookCover ? this.getBookCoverUrl(book.id) : null,
      }
    })

    return data
  }

  async createBook(
    event: H3Event<EventHandlerRequest>,
    book: BookDB,
    collections: CollectionDB['id'][],
  ): ReturnType<DBClient['createBook']> {
    await this.client.read()

    // update author information
    const existingAuthor = this.client.data.authors.find(
      ({ id }) => id === book.author_id,
    )

    const authorId = existingAuthor?.id ?? uuidv4()

    if (!existingAuthor) {
      if (book.author_id) {
        this.client.data.authors.push({
          id: authorId,
          name: book.author_id,
          created_at: new Date().toISOString(),
        })
      }
    }

    // create or update book
    const bookDb: BookDB = {
      ...book,
      author_id: book.author_id ? authorId : null,
    }

    const bookIndex = this.client.data.books.findIndex(
      (b) => b.id === bookDb.id,
    )

    if (bookIndex !== -1) {
      this.client.data.books.splice(bookIndex, 1, bookDb)
    } else {
      this.client.data.books.push(bookDb)
    }

    // update collection information
    const existingCollectionIds = this.client.data['collection-book']
      .filter(({ book_id }) => book_id === bookDb.id)
      .map(({ collection_id }) => collection_id)

    const collectionsToAdd = difference(collections, existingCollectionIds)
    const collectionsToRemove = difference(existingCollectionIds, collections)

    this.client.data['collection-book'] = this.client.data['collection-book']
      .filter(
        ({ book_id, collection_id }) =>
          book_id !== bookDb.id || !collectionsToRemove.includes(collection_id),
      )
      .concat(
        collectionsToAdd.map((collection_id) => ({
          book_id: bookDb.id,
          collection_id,
          order: this.client.data['collection-book'].filter(
            (cb) => collection_id === cb.collection_id,
          ).length,
        })),
      )

    await this.client.write()

    return bookDb
  }

  async deleteBook(
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ): ReturnType<DBClient['deleteBook']> {
    await this.client.read()

    this.client.data.books = this.client.data.books.filter(
      (book) => book.id !== id,
    )
    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => book_id !== id)

    await this.client.write()

    return id
  }

  async deleteBooks(
    event: H3Event<EventHandlerRequest>,
    ids: BookDB['id'][],
  ): ReturnType<DBClient['deleteBooks']> {
    await this.client.read()

    this.client.data.books = this.client.data.books.filter(
      (b) => !ids.includes(b.id),
    )

    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => ids.includes(book_id))

    await this.client.write()

    return ids
  }

  async getBookCount(): ReturnType<DBClient['getBookCount']> {
    await this.client.read()

    return this.client.data.books.length
  }

  async getLatestBooks(): ReturnType<DBClient['getLatestBooks']> {
    await this.client.read()

    return this.client.data.books
      .sort(({ created_at: c1 }, { created_at: c2 }) =>
        new Date(c1) > new Date(c2) ? 1 : -1,
      )
      .slice(0, 9)
  }

  async getOrderedBooks(
    event: H3Event<EventHandlerRequest>,
    { property, count }: GetOrderedBooksQuerySearchParams,
  ): ReturnType<DBClient['getOrderedBooks']> {
    await this.client.read()

    const filteredBooks = this.client.data.books
      .filter((b) => b[property])
      .sort((b1, b2) =>
        b1[property]!.toLocaleString().localeCompare(
          b2[property]!.toLocaleString(),
          undefined,
          { numeric: true },
        ),
      )

    if (count !== undefined) {
      return filteredBooks.slice(0, count)
    }

    return filteredBooks
  }

  async getBookCover(
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ): ReturnType<DBClient['getBookCover']> {
    const fileName = await this.getBookCoverFileName(id)

    const filePath = fileName && (await this.fileStorage.getFile(fileName))

    if (filePath) {
      return sendStream(event, createReadStream(filePath))
    }
  }

  async updateBookCover(
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
    file: ServerFile,
  ): ReturnType<DBClient['updateBookCover']> {
    const fileName = await this.getBookCoverFileName(id)

    if (fileName) {
      await this.fileStorage.deleteFile(fileName)
    }

    await this.fileStorage.saveFile(id, file)

    const bookCoverUrl = this.getBookCoverUrl(id)

    return bookCoverUrl
  }

  async deleteBookCover(
    event: H3Event<EventHandlerRequest>,
    id: BookDB['id'],
  ): ReturnType<DBClient['deleteBookCover']> {
    const fileName = await this.getBookCoverFileName(id)

    if (fileName) {
      await this.fileStorage.deleteFile(fileName)

      return null
    }

    const error = { message: `Book cover not found for ${id} to delete` }
    logger.error(error)
    throw createError(error.message)
  }

  async getCollection(
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB['id'],
  ): ReturnType<DBClient['getCollection']> {
    await this.client.read()

    const collection = this.client.data.collections.find((c) => c.id === id)
    const books = this.client.data['collection-book'].filter(
      (cb) => cb.collection_id === id,
    )

    return collection
      ? {
          ...collection,
          ['collection-book']: books,
        }
      : null
  }

  async getCollections(): ReturnType<DBClient['getCollections']> {
    await this.client.read()

    return this.client.data.collections.map((collection) => ({
      ...collection,
      ['collection-book']: this.client.data['collection-book'].filter(
        (cb) => cb.collection_id === collection.id,
      ),
    }))
  }

  async getCollectionCount(): ReturnType<DBClient['getCollectionCount']> {
    await this.client.read()

    return this.client.data.collections.length
  }

  async createCollection(
    event: H3Event<EventHandlerRequest>,
    collection: CollectionDB,
    books: Collection['books'],
  ): ReturnType<DBClient['createCollection']> {
    await this.client.read()

    const bookIndex = this.client.data.collections.findIndex(
      (b) => b.id === collection.id,
    )

    if (bookIndex !== -1) {
      this.client.data.collections.splice(bookIndex, 1, collection)
    } else {
      this.client.data.collections.push(collection)
    }

    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter((cb) => cb.collection_id !== collection.id)

    const collectionBooks = books.map((book) => ({
      book_id: book.id,
      collection_id: collection.id,
      order: book.order,
    }))

    this.client.data['collection-book'] =
      this.client.data['collection-book'].concat(collectionBooks)

    await this.client.write()

    return { ...collection, 'collection-book': collectionBooks }
  }

  async deleteCollection(
    event: H3Event<EventHandlerRequest>,
    id: CollectionDB['id'],
    params: DeleteCollectionParams,
  ): ReturnType<DBClient['deleteCollection']> {
    if (DEFAULT_COLLECTIONS.includes(id)) {
      const error = { message: `Cannot delete ${id}` }
      logger.error(error)
      throw createError(error.message)
    }

    await this.client.read()

    const booksInCollection = this.client.data['collection-book']
      .filter(({ collection_id }) => collection_id === id)
      .map(({ book_id }) => book_id)

    this.client.data.collections = this.client.data.collections.filter(
      (c) => c.id !== id,
    )

    if (params.deleteBooks) {
      this.client.data.books = this.client.data.books.filter(
        (book) => !booksInCollection.includes(book.id),
      )
      this.client.data['collection-book'] = this.client.data[
        'collection-book'
      ].filter(({ book_id }) => !booksInCollection.includes(book_id))
    } else {
      this.client.data['collection-book'] = this.client.data[
        'collection-book'
      ].filter(({ collection_id }) => collection_id !== id)
    }

    await this.client.write()

    return id
  }

  async isLibraryEmpty(): ReturnType<DBClient['isLibraryEmpty']> {
    await this.client.read()

    return this.client.data.books.length === 0
  }

  async resetLibrary(): ReturnType<DBClient['resetLibrary']> {
    await this.client.update((data) => {
      data.authors = []
      data.books = []
      data.collections = []
      data['collection-book'] = []
    })

    return true
  }

  async importLibrary(
    event: H3Event<EventHandlerRequest>,
    books: BookDB[],
  ): ReturnType<DBClient['importLibrary']> {
    await this.client.read()

    this.client.data.books = this.client.data.books.concat(
      books.map(({ id, ...book }) => ({
        ...bookToDbBook(book),
        id: uuidv4(),
        created_at: new Date().toISOString(),
      })),
    )

    await this.client.write()

    return true
  }

  async checkLibraryIntegrity(): ReturnType<DBClient['checkLibraryIntegrity']> {
    await this.client.read()

    const authorIds = this.client.data.authors.map(({ id }) => id)
    const collectionIds = this.client.data.collections.map(({ id }) => id)
    const bookIds = this.client.data.books.map(({ id }) => id)

    const booksWithNonExistentCollections = this.client.data[
      'collection-book'
    ].filter(({ collection_id }) => !collectionIds.includes(collection_id))

    const booksWithNonExistentAuthors = this.client.data.books.filter(
      ({ author_id }) => author_id && !authorIds.includes(author_id),
    )

    const collectionsWithNonExistentBooks = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => !bookIds.includes(book_id))

    return {
      books: [
        ...booksWithNonExistentCollections.map(
          ({ book_id, collection_id }) =>
            `Book ${book_id} is assigned collection ${collection_id}, which does not exist.`,
        ),
        ...booksWithNonExistentAuthors.map(
          ({ id, author_id }) =>
            `Book ${id} is assigned author ${author_id}, which does not exist.`,
        ),
      ],
      collections: collectionsWithNonExistentBooks.map(
        ({ book_id, collection_id }) =>
          `Collection ${collection_id} contains book ${book_id}, which does not exist`,
      ),
      authors: [],
    }
  }
}
