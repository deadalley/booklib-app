import type { Page } from '@playwright/test'
import { expect, makeAuthor, makeBook, makeDb, seedLibrary } from './fixtures'

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

// The books page needs a book, or it sends an empty library home
export const otherBook = makeBook('Kindred')

/** Add book → Scan ISBN, from the books page */
export async function startScan(page: Page) {
  await seedLibrary(page, makeDb({ authors: [leGuin], books: [otherBook] }))
  await page.goto('/library/books')
  await page.getByRole('button', { name: 'Add book' }).click()
  await page
    .getByTestId('add-book-options')
    .getByRole('button', { name: 'Scan ISBN' })
    .click()
  await expect(page.getByTestId('isbn-scanner')).toBeVisible()
}

export async function typeIsbn(page: Page, isbn: string) {
  const scanner = page.getByTestId('isbn-scanner')
  await scanner.getByLabel('Or type the ISBN').fill(isbn)
  await scanner.getByRole('button', { name: 'Look up' }).click()
}
