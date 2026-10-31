import { test as base, expect, type Page } from '@playwright/test'
import type { Database } from '../types/api'
import type { AuthorDB, BookDB, CollectionDB, GoalDB } from '../types/database'

export const STORAGE_KEY = 'booklib-data'

const DEFAULT_COLLECTIONS: CollectionDB[] = [
  { id: 'favorite', name: 'Favorites', created_at: '2024-01-01T00:00:00.000Z' },
  { id: 'tbr', name: 'To Be Read', created_at: '2024-01-01T00:00:00.000Z' },
  { id: 'wishlist', name: 'Wishlist', created_at: '2024-01-01T00:00:00.000Z' },
]

/**
 * Deterministic ids derived from the name, so ids are identical when
 * Playwright collects tests and when a worker runs them (a module-level
 * counter would differ depending on which files a worker loaded first).
 */
const idFor = (prefix: string, name: string) =>
  `${prefix}-${name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

export function makeAuthor(
  name: string,
  overrides: Partial<AuthorDB> = {},
): AuthorDB {
  return {
    id: idFor('author', name),
    name,
    created_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function makeBook(
  title: string,
  overrides: Partial<BookDB> = {},
): BookDB {
  return {
    id: idFor('book', title),
    title,
    author_id: null,
    cover_src: null,
    created_at: '2024-01-01T00:00:00.000Z',
    started_at: null,
    finished_at: null,
    current_page: null,
    genres: [],
    notes: [],
    isbn: null,
    language: null,
    original_language: null,
    original_title: null,
    pages: 300,
    progress_status: null,
    property_status: null,
    format: null,
    publisher: null,
    rating: null,
    summary: null,
    year: null,
    collections: [],
    ...overrides,
  }
}

export function makeGoal(
  title: string,
  overrides: Partial<GoalDB> = {},
): GoalDB {
  const year = new Date().getFullYear()
  return {
    id: idFor('goal', title),
    title,
    interval: 'total',
    amount: 10,
    created_at: `${year}-01-01T00:00:00.000Z`,
    start_at: `${year}-01-01T00:00:00.000Z`,
    finish_at: `${year}-12-31T23:59:59.999Z`,
    status: 'tracking',
    author_id: null,
    genres: [],
    completed_at: null,
    auto: false,
    type: 'books',
    entries: [],
    ...overrides,
  } as GoalDB
}

export function makeDb(data: Partial<Database> = {}): Database {
  return {
    authors: data.authors ?? [],
    books: data.books ?? [],
    collections: [...DEFAULT_COLLECTIONS, ...(data.collections ?? [])],
    'collection-book': data['collection-book'] ?? [],
    goals: data.goals ?? [],
  }
}

/**
 * Seeds the library before the app boots. The seed is applied once per
 * browser context, so page reloads keep whatever the app wrote since.
 */
export async function seedLibrary(page: Page, db: Database) {
  await page.addInitScript(
    ({ key, value }) => {
      if (!window.sessionStorage.getItem('__seeded')) {
        window.localStorage.setItem(key, value)
        window.sessionStorage.setItem('__seeded', '1')
      }
    },
    { key: STORAGE_KEY, value: JSON.stringify(db) },
  )
}

/** Reads the library as currently stored by the app. */
export async function readLibrary(page: Page): Promise<Database> {
  const raw = await page.evaluate(
    (key) => window.localStorage.getItem(key),
    STORAGE_KEY,
  )
  return JSON.parse(raw ?? 'null') as Database
}

/** Waits until the app has hydrated (the navigation is interactive). */
export async function waitForApp(page: Page) {
  await expect(page.locator('nav.nav-sidebar')).toBeVisible()
}

/** Fails a test on uncaught page errors. */
export const test = base.extend<{ pageErrors: string[] }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await use(errors)
      expect(errors, 'uncaught errors in the page').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
