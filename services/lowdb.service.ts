import type {
  Database,
  DBClient,
  DeleteAuthorParams,
  DeleteCollectionParams,
  GetBooksQuerySearchParams,
  GetOrderedBooksQuerySearchParams,
} from '~/types/api'
import type { Low } from 'lowdb'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from '~/types/database'
import { v4 as uuidv4 } from 'uuid'
import {
  logger,
  DEFAULT_COLLECTIONS,
  DEFAULT_COLLECTIONS_INIT,
  PROGRESS_STATUS,
  BOOK_FORMAT,
  GOAL_TYPE,
  GOAL_INTERVAL,
  GOAL_STATUS,
  now,
} from '../utils'
import type { ServerFile } from 'nuxt-file-storage'
import { difference, indexBy, prop, uniq } from 'ramda'
import { FileStorageService } from './file-storage.service'
import type { Collection } from '~/types/collection'

export class LowDBClient implements DBClient {
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

  async getAuthors() {
    await this.client.read()

    const data = this.client.data.authors

    return data
  }

  async deleteAuthor(id: AuthorDB['id'], params: DeleteAuthorParams) {
    await this.client.read()

    this.client.data.authors = this.client.data.authors.filter(
      (author) => author.id !== id,
    )

    if (params.deleteBooks) {
      this.client.data.books = this.client.data.books.filter((book) => {
        if (book.author_id === id) {
          this.getBookCoverFileName(book.id).then((fileName) => {
            if (fileName) {
              return this.fileStorage.deleteFile(fileName)
            }
          })
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

  async getBook(id: BookDB['id']) {
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

  async getBooks({ page, pageSize, bookProgress }: GetBooksQuerySearchParams) {
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

  async createBook(book: BookDB, collections: CollectionDB['id'][]) {
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
          created_at: now(),
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

  async deleteBook(id: BookDB['id']) {
    await this.client.read()

    this.client.data.books = this.client.data.books.filter(
      (book) => book.id !== id,
    )
    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => book_id !== id)

    await this.client.write()

    const fileName = await this.getBookCoverFileName(id)

    if (fileName) {
      await this.fileStorage.deleteFile(fileName)
    }

    return id
  }

  async deleteBooks(ids: BookDB['id'][]) {
    await this.client.read()

    this.client.data.books = this.client.data.books.filter(
      (b) => !ids.includes(b.id),
    )

    this.client.data['collection-book'] = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => !ids.includes(book_id))

    await this.client.write()

    ids.forEach((id) => {
      this.getBookCoverFileName(id).then((fileName) => {
        if (fileName) {
          return this.fileStorage.deleteFile(fileName)
        }
      })
    })

    return ids
  }

  async getBookCount() {
    await this.client.read()

    return this.client.data.books.length
  }

  async getLatestBooks() {
    const bookCovers = await this.fileStorage.getAllFileNames()

    await this.client.read()

    return this.client.data.books
      .concat()
      .sort(({ created_at: c1 }, { created_at: c2 }) =>
        new Date(c1) < new Date(c2) ? 1 : -1,
      )
      .slice(0, 10)
      .map((book) => {
        const hasBookCover = bookCovers.find(this.isBookCover(book.id))

        return {
          ...book,
          cover_src: hasBookCover ? this.getBookCoverUrl(book.id) : null,
        }
      })
  }

  async getOrderedBooks({
    property,
    count,
  }: GetOrderedBooksQuerySearchParams): ReturnType<
    DBClient['getOrderedBooks']
  > {
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

  async getBookCover(id: BookDB['id']) {
    const fileName = await this.getBookCoverFileName(id)

    const filePath = fileName && (await this.fileStorage.getFile(fileName))

    return filePath || null
  }

  async updateBookCover(id: BookDB['id'], file: ServerFile) {
    const fileName = await this.getBookCoverFileName(id)

    if (fileName) {
      await this.fileStorage.deleteFile(fileName)
    }

    await this.fileStorage.saveFile(id, file)

    const bookCoverUrl = this.getBookCoverUrl(id)

    return bookCoverUrl
  }

  async deleteBookCover(id: BookDB['id']) {
    const fileName = await this.getBookCoverFileName(id)

    if (fileName) {
      await this.fileStorage.deleteFile(fileName)

      return null
    }

    const error = { message: `Book cover not found for ${id} to delete` }
    logger.error(error)
    throw createError(error.message)
  }

  async getCollection(id: CollectionDB['id']) {
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

  async getCollections() {
    await this.client.read()

    return this.client.data.collections.map((collection) => ({
      ...collection,
      ['collection-book']: this.client.data['collection-book'].filter(
        (cb) => cb.collection_id === collection.id,
      ),
    }))
  }

  async getCollectionCount() {
    await this.client.read()

    return this.client.data.collections.length
  }

  async createCollection(collection: CollectionDB, books: Collection['books']) {
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
    id: CollectionDB['id'],
    params: DeleteCollectionParams,
  ) {
    if (DEFAULT_COLLECTIONS.includes(id)) {
      const error = { message: `Cannot delete ${id}` }
      logger.error(error)
      throw createError(error.message)
    }

    await this.client.read()

    const booksInCollection = this.client.data['collection-book']
      .filter(({ collection_id }) => collection_id === id)
      .map(({ book_id }) => {
        if (params.deleteBooks) {
          this.getBookCoverFileName(book_id).then((fileName) => {
            if (fileName) {
              return this.fileStorage.deleteFile(fileName)
            }
          })
        }

        return book_id
      })

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

  async getGoal() {
    return null
  }

  async getGoals() {
    await this.client.read()

    return this.client.data.goals
  }

  async createGoal(goal: GoalDB) {
    await this.client.read()

    // create or update goal
    const goalIndex = this.client.data.goals.findIndex((b) => b.id === goal.id)

    if (goalIndex !== -1) {
      this.client.data.goals.splice(goalIndex, 1, goal)
    } else {
      this.client.data.goals.push(goal)
    }

    await this.client.write()

    return goal
  }

  async deleteGoal(id: GoalDB['id']) {
    await this.client.read()

    this.client.data.goals = this.client.data.goals.filter(
      (goal) => goal.id !== id,
    )

    await this.client.write()

    return id
  }

  async isLibraryEmpty() {
    await this.client.read()

    return this.client.data.books.length === 0
  }

  async resetLibrary() {
    await this.client.update((data) => {
      data.authors = []
      data.books = []
      data.collections = DEFAULT_COLLECTIONS_INIT.map((c) => ({
        ...c,
        created_at: now(),
      }))
      data['collection-book'] = []
    })

    return true
  }

  async importLibrary(books: BookDB[]) {
    await this.client.read()

    const existingAuthorsByName = indexBy(
      prop('name'),
      this.client.data.authors,
    )
    const authorsToCreate = uniq(
      books
        .map(({ author_id }) => author_id)
        .filter((author_id): author_id is string => !!author_id),
    )

    authorsToCreate.forEach((authorName) => {
      if (!existingAuthorsByName[authorName]) {
        this.client.data.authors.push({
          id: uuidv4(),
          name: authorName,
          created_at: now(),
        })
      }
    })

    const allAuthorsByName = indexBy(prop('name'), this.client.data.authors)

    this.client.data.books = this.client.data.books.concat(
      books.map(({ id, ...book }) => ({
        ...book,
        id: uuidv4(),
        created_at: now(),
        author_id:
          book.author_id && (allAuthorsByName[book.author_id]?.id ?? null),
      })),
    )

    await this.client.write()

    return true
  }

  async checkLibraryIntegrity() {
    await this.client.read()

    const booksById = indexBy(prop('id'), this.client.data.books)
    const collectionsById = indexBy(prop('id'), this.client.data.collections)

    const authorIds = this.client.data.authors.map(({ id }) => id)
    const collectionIds = Object.keys(collectionsById)
    const bookIds = Object.keys(booksById)

    const booksWithNonExistentCollections = this.client.data[
      'collection-book'
    ].filter(({ collection_id }) => !collectionIds.includes(collection_id))

    const booksWithNonExistentAuthors = this.client.data.books.filter(
      ({ author_id }) => author_id && !authorIds.includes(author_id),
    )

    const booksWithOutdatedStatus = this.client.data.books.filter(
      ({ progress_status }) =>
        progress_status && !PROGRESS_STATUS.includes(progress_status),
    )

    const booksWithOutdatedFormat = this.client.data.books.filter(
      ({ format }) => format && !BOOK_FORMAT.includes(format),
    )

    const goalsWithOutdatedType = this.client.data.goals.filter(
      ({ type }) => type && !GOAL_TYPE.includes(type),
    )

    const goalsWithOutdatedInterval = this.client.data.goals.filter(
      ({ interval }) => interval && !GOAL_INTERVAL.includes(interval),
    )

    const goalsWithOutdatedStatus = this.client.data.goals.filter(
      ({ status }) => status && !GOAL_STATUS.includes(status),
    )

    const collectionsWithNonExistentBooks = this.client.data[
      'collection-book'
    ].filter(({ book_id }) => !bookIds.includes(book_id))

    return {
      books: [
        ...booksWithNonExistentCollections.map(
          ({ book_id, collection_id }) =>
            `Book ${booksById[book_id]?.title ?? book_id} is assigned collection ${collectionsById[collection_id]?.name ?? collection_id}, which does not exist.`,
        ),
        ...booksWithNonExistentAuthors.map(
          ({ title, author_id }) =>
            `Book ${title} is assigned author ${author_id}, which does not exist.`,
        ),
        ...booksWithOutdatedStatus.map(
          ({ title, progress_status }) =>
            `Book ${title} has invalid progress status ${progress_status}`,
        ),
        ...booksWithOutdatedFormat.map(
          ({ title, format }) => `Book ${title} has invalid format ${format}`,
        ),
      ],
      collections: collectionsWithNonExistentBooks.map(
        ({ book_id, collection_id }) =>
          `Collection ${collectionsById[collection_id]?.name ?? collection_id} contains book ${booksById[book_id]?.title ?? book_id}, which does not exist`,
      ),
      authors: [],
      goals: [
        ...goalsWithOutdatedType.map(
          ({ title, type }) => `Goal ${title} has invalid type ${type}`,
        ),
        ...goalsWithOutdatedInterval.map(
          ({ title, interval }) =>
            `Goal ${title} has invalid interval ${interval}`,
        ),
        ...goalsWithOutdatedStatus.map(
          ({ title, status }) => `Goal ${title} has invalid status ${status}`,
        ),
      ],
    }
  }
}
