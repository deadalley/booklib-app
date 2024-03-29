import { faker } from '@faker-js/faker'
import type { Book } from '~/types/book'

export function buildBook(overwrite?: Partial<Book>): Book {
  return {
    title: faker.commerce.productName(),
    coverSrc: faker.string.alpha(),
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
    ...overwrite,
  }
}
