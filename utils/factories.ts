import { faker } from '@faker-js/faker'
import type { Book } from '~/types/book'
import type { Collection } from '~/types/collection'

export function buildBook(overwrite?: Partial<Book>): Book {
  return {
    title: faker.commerce.productName(),
    coverSrc: faker.image.urlPicsumPhotos({ height: 540, width: 340 }),
    createdAt: faker.date.past().toISOString(),
    id: faker.number.float(),
    isbn: faker.commerce.isbn(),
    language: 'English',
    originalTitle: faker.commerce.productName(),
    originalLanguage: 'English',
    pages: faker.number.int(),
    publisher: faker.company.name(),
    rating: faker.number.int(),
    summary: faker.lorem.lines(5),
    year: faker.date.past().getFullYear(),
    genres: faker.helpers.multiple(faker.color.human, { count: 5 }),
    progressStatus: 'not-read',
    startedAt: faker.date.past().toISOString(),
    finishedAt: faker.date.past().toISOString(),
    collections: [],
    ...overwrite,
  }
}

export function buildCollection(overwrite?: Partial<Collection>): Collection {
  return {
    id: faker.number.float(),
    name: faker.commerce.productName(),
    books: [
      { id: 1, order: 0 },
      { id: 2, order: 1 },
      { id: 3, order: 2 },
    ],
    createdAt: faker.date.past().toISOString(),
    ...overwrite,
  }
}
