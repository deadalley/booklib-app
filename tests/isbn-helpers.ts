import type { Page } from '@playwright/test'
import { expect, makeAuthor, makeDb, seedLibrary } from './fixtures'

/* Shared by the ISBN lookup and camera scan tests */

export const ISBN = '9780060512750'
export const leGuin = makeAuthor('Ursula K. Le Guin')

const OPEN_LIBRARY = {
  [`ISBN:${ISBN}`]: {
    title: 'The Dispossessed',
    authors: [{ name: 'Ursula K. Le Guin' }],
    publishers: [{ name: 'Harper Perennial' }],
    publish_date: 'October 2003',
    number_of_pages: 387,
  },
}
const GOOGLE_BOOKS = {
  items: [
    {
      volumeInfo: {
        title: 'The Dispossessed',
        description: 'Shevek, a brilliant physicist, decides to act.',
        language: 'en',
        categories: ['Fiction / Science Fiction / General'],
      },
    },
  ],
}

/** Answers lookups like Open Library and Google Books would */
export async function mockLookups(page: Page) {
  await page.route('https://openlibrary.org/**', (route) =>
    route.fulfill({ json: OPEN_LIBRARY }),
  )
  await page.route('https://www.googleapis.com/books/**', (route) =>
    route.fulfill({ json: GOOGLE_BOOKS }),
  )
}

export async function openNewBook(page: Page) {
  await seedLibrary(page, makeDb({ authors: [leGuin] }))
  await page.goto('/library/books/new')
  await expect(
    page.getByRole('heading', { name: 'Untitled book' }),
  ).toBeVisible()
}

export async function typeIsbn(page: Page, isbn: string) {
  const scanner = page.getByTestId('isbn-scanner')
  await scanner.getByLabel('Or type the ISBN').fill(isbn)
  await scanner.getByRole('button', { name: 'Look up' }).click()
}
