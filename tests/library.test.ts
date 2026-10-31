import type { Page } from '@playwright/test'
import {
  expect,
  makeAuthor,
  makeBook,
  makeDb,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const leGuin = makeAuthor('Ursula K. Le Guin')
const marquez = makeAuthor('Gabriel García Márquez')
const shelf = {
  id: 'short-fiction',
  name: 'Short fiction',
  created_at: '2024-01-01T00:00:00.000Z',
}

const dispossessed = makeBook('The Dispossessed', {
  author_id: leGuin.id,
  language: 'en',
  publisher: 'Harper',
  rating: 5,
  year: 1974,
  genres: ['Science Fiction'],
})
const earthsea = makeBook('A Wizard of Earthsea', {
  author_id: leGuin.id,
  language: 'en',
  publisher: 'Parnassus',
  year: 1968,
  genres: ['Fantasy'],
  collections: [shelf.id],
})
const cien = makeBook('Cien años de soledad', {
  author_id: marquez.id,
  language: 'es',
  publisher: 'Sudamericana',
  year: 1967,
  pages: 1200, // longer than any default range bound
})
const future = makeBook('Not Out Yet', {
  year: new Date().getFullYear() + 1,
})

const library = makeDb({
  authors: [leGuin, marquez],
  books: [dispossessed, earthsea, cien, future],
  collections: [shelf],
  'collection-book': [
    { book_id: earthsea.id, collection_id: shelf.id, order: 0 },
  ],
})

const tiles = (page: Page) => page.locator('.book-tile')

/** On phones the toolbar is collapsed behind a toggle. */
async function revealActions(page: Page) {
  const toggle = page.getByRole('button', { name: 'Show actions' })
  if (await toggle.isVisible()) await toggle.click()
}

async function openFilters(page: Page) {
  await revealActions(page)
  await page.getByRole('button', { name: 'Filter' }).first().click()
  const panel = page.getByRole('dialog', { name: 'Filter' })
  await expect(panel).toBeVisible()
  return panel
}

async function startManaging(page: Page) {
  await revealActions(page)
  await page.getByRole('button', { name: 'Manage' }).click()
  await expect(
    page.getByRole('toolbar', { name: 'Bulk actions' }),
  ).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await seedLibrary(page, library)
  await page.goto('/library/books')
  await expect(tiles(page)).toHaveCount(4)
})

test('shows every book by default, including long and unreleased ones', async ({
  page,
}) => {
  for (const book of [dispossessed, earthsea, cien, future]) {
    await expect(page.getByRole('heading', { name: book.title })).toBeVisible()
  }
})

test.describe('filters', () => {
  test('a filter checkbox toggles on and off with one click each', async ({
    page,
  }) => {
    const panel = await openFilters(page)
    const spanish = panel.getByRole('checkbox', { name: 'Spanish' })

    await spanish.click()
    await expect(spanish).toBeChecked()
    await expect(tiles(page)).toHaveCount(1)

    await spanish.click()
    await expect(spanish).not.toBeChecked()
    await expect(tiles(page)).toHaveCount(4)
  })

  test('language and original language checkboxes are independent', async ({
    page,
  }) => {
    const panel = await openFilters(page)
    await panel.getByRole('checkbox', { name: 'English' }).first().click()
    await expect(panel.locator('#filter-language-en')).toBeChecked()
    await expect(panel.locator('#filter-original-language-en')).toHaveCount(0)
  })

  test('filters by collection', async ({ page }) => {
    const panel = await openFilters(page)
    await panel.getByRole('checkbox', { name: 'Short fiction' }).click()
    await expect(tiles(page)).toHaveCount(1)
    await expect(tiles(page)).toContainText(earthsea.title)
  })

  test('combines categories with AND', async ({ page }) => {
    const panel = await openFilters(page)
    await panel.getByRole('checkbox', { name: 'English' }).first().click()
    await panel.getByRole('checkbox', { name: 'Harper' }).click()
    await expect(tiles(page)).toHaveCount(1)
    await expect(tiles(page)).toContainText(dispossessed.title)
  })

  test('closes with Escape', async ({ page }) => {
    const panel = await openFilters(page)
    await page.keyboard.press('Escape')
    await expect(panel).toBeHidden()
  })
})

test('search ignores accents', async ({ page }) => {
  await revealActions(page)
  await page.getByRole('textbox').first().fill('anos')
  await expect(tiles(page)).toHaveCount(1)
  await expect(tiles(page)).toContainText(cien.title)
})

test.describe('bulk actions', () => {
  test('adding books to a collection keeps all their other data', async ({
    page,
  }) => {
    await startManaging(page)
    await page.getByRole('checkbox', { name: dispossessed.title }).click()
    await page.getByRole('checkbox', { name: cien.title }).click()

    await page.getByRole('button', { name: 'Collection' }).click()
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Choose collection' })
      .click()
    await page.getByRole('option', { name: 'Short fiction' }).click()
    await page.getByRole('button', { name: 'Move' }).click()

    await expect
      .poll(async () =>
        (await readLibrary(page))['collection-book']
          .filter((cb) => cb.collection_id === shelf.id)
          .map((cb) => cb.book_id)
          .sort(),
      )
      .toEqual([dispossessed.id, earthsea.id, cien.id].sort())

    const db = await readLibrary(page)
    expect(db.books.find((b) => b.id === dispossessed.id)).toMatchObject({
      title: dispossessed.title,
      author_id: leGuin.id,
      rating: 5,
      publisher: 'Harper',
      genres: ['Science Fiction'],
    })
    expect(db.books.find((b) => b.id === cien.id)).toMatchObject({
      title: cien.title,
      author_id: marquez.id,
      pages: 1200,
    })
  })

  test('changing the author keeps all other data', async ({ page }) => {
    await startManaging(page)
    await page.getByRole('checkbox', { name: cien.title }).click()
    await page.getByRole('button', { name: 'Author' }).click()
    await page
      .getByRole('combobox')
      .filter({ hasText: 'Choose author' })
      .click()
    await page.getByRole('option', { name: leGuin.name }).click()
    await page.getByRole('button', { name: 'Apply' }).click()

    await expect
      .poll(
        async () =>
          (await readLibrary(page)).books.find((b) => b.id === cien.id)
            ?.author_id,
      )
      .toBe(leGuin.id)
    expect(
      (await readLibrary(page)).books.find((b) => b.id === cien.id),
    ).toMatchObject({ title: cien.title, language: 'es', year: 1967 })
  })

  test('only visible selected books are removed', async ({ page }) => {
    await startManaging(page)
    await page.getByRole('checkbox', { name: dispossessed.title }).click()
    await page.getByRole('checkbox', { name: cien.title }).click()

    // Hide one of the selected books with a search
    await page.getByRole('textbox').first().fill('Dispossessed')
    await expect(tiles(page)).toHaveCount(1)
    const toolbar = page.getByRole('toolbar', { name: 'Bulk actions' })
    await expect(toolbar.locator('.bulk-actions-count')).toHaveText('1')
    await expect(toolbar).toContainText('Item Selected')

    await page.getByRole('button', { name: 'Remove' }).click()
    await page.getByRole('button', { name: 'Delete' }).click()

    await expect
      .poll(async () =>
        (await readLibrary(page)).books.map((b) => b.title).sort(),
      )
      .toEqual([earthsea.title, cien.title, future.title].sort())
  })
})
