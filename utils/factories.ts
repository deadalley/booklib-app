import { faker } from '@faker-js/faker'
import type { AuthorDB, BookDB, CollectionDB } from '~/types/database'

export function buildBook(overwrite?: Partial<BookDB>): BookDB {
  return {
    title: faker.commerce.productName(),
    cover_src: faker.image.urlPicsumPhotos({ height: 540, width: 340 }),
    created_at: faker.date.past().toISOString(),
    id: faker.string.uuid(),
    isbn: faker.commerce.isbn(),
    language: 'English',
    original_title: faker.commerce.productName(),
    original_language: 'English',
    pages: faker.number.int(),
    publisher: faker.company.name(),
    rating: faker.number.int(),
    summary: faker.lorem.lines(5),
    year: faker.date.past().getFullYear(),
    genres: faker.helpers.multiple(faker.color.human, { count: 5 }),
    started_at: faker.date.past().toISOString(),
    finished_at: faker.date.past().toISOString(),
    collections: [],
    author_id: faker.string.uuid(),
    progress_status: 'not-owned',
    ...overwrite,
  }
}

export function buildCollection(
  overwrite?: Partial<CollectionDB>,
): CollectionDB {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    created_at: faker.date.past().toISOString(),
    ...overwrite,
  }
}

export function buildAuthor(overwrite?: Partial<AuthorDB>): AuthorDB {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    created_at: faker.date.past().toISOString(),
    ...overwrite,
  }
}
