import { readFileSync } from 'fs'
import type { Download, Page } from '@playwright/test'
import {
  expect,
  makeAuthor,
  makeBook,
  makeDb,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const year = new Date().getFullYear()

const clarke = makeAuthor('Susanna Clarke')
const piranesi = makeBook('Piranesi', {
  author_id: clarke.id,
  rating: 4.5,
  progress_status: 'read',
  started_at: `${year}-01-02T00:00:00.000Z`,
  finished_at: `${year}-01-20T00:00:00.000Z`,
  current_page: 272,
  pages: 272,
  genres: ['Fantasy'],
  notes: [
    {
      id: 'n1',
      createdAt: `${year}-01-05T00:00:00.000Z`,
      page: 88,
      content: 'The Beauty of the House is immeasurable.',
      highlight: { location: 'page:88' },
    },
  ],
})

async function saveImage(page: Page) {
  const card = page.getByTestId('share-card')
  await expect(card.getByTestId('share-preview')).toBeVisible()
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Save image' }).click(),
  ])
  const bytes = readFileSync(await file.path())
  return { name: file.suggestedFilename(), bytes }
}

test.describe('share cards', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ authors: [clarke], books: [piranesi] }))
  })

  test('saves a book card as a PNG, in light or dark', async ({ page }) => {
    await page.goto(`/library/books/${piranesi.id}`)
    await page.getByRole('button', { name: 'Share', exact: true }).click()

    const preview = page.getByTestId('share-preview')
    await expect(preview).toBeVisible()
    const light = await preview.getAttribute('src')
    await page.getByRole('radio', { name: 'Dark' }).click()
    await expect(preview).not.toHaveAttribute('src', light!)

    const { name, bytes } = await saveImage(page)
    expect(name).toBe('piranesi.png')
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_MAGIC)
    await expect(page.getByText('Saved to your downloads.')).toBeVisible()
  })

  test('shares a highlight as a quote card', async ({ page }) => {
    await page.goto(`/library/books/${piranesi.id}`)
    await page
      .getByRole('button', { name: 'Share highlight' })
      .click({ force: true })
    await expect(
      page.getByRole('heading', { name: 'Share this highlight' }),
    ).toBeVisible()
    const { name, bytes } = await saveImage(page)
    expect(name).toBe('piranesi-highlight.png')
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_MAGIC)
  })

  test('shares the Year in Review', async ({ page }) => {
    await page.goto(`/stats/year/${year}`)
    await page.getByRole('button', { name: 'Share', exact: true }).click()
    const { name, bytes } = await saveImage(page)
    expect(name).toBe(`booklib-${year}-in-books.png`)
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_MAGIC)
  })
})

test.describe('shared lists', () => {
  const leGuin = makeAuthor('Ursula K. Le Guin')
  const leftHand = makeBook('The Left Hand of Darkness', {
    author_id: leGuin.id,
    isbn: '9780441478125',
    rating: 5,
    progress_status: 'read',
    notes: [{ createdAt: '2024-01-01T00:00:00.000Z', content: 'Private.' }],
  })
  const list = {
    id: 'collection-cosy-autumn',
    name: 'Cosy autumn',
    created_at: '2024-01-01T00:00:00.000Z',
  }

  async function exportList(page: Page): Promise<Download> {
    await seedLibrary(
      page,
      makeDb({
        authors: [clarke, leGuin],
        books: [piranesi, leftHand],
        collections: [list],
        'collection-book': [
          { book_id: piranesi.id, collection_id: list.id, order: 0 },
          { book_id: leftHand.id, collection_id: list.id, order: 1 },
        ],
      }),
    )
    await page.goto(`/library/collections/${list.id}`)
    const [file] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('share-list').click(),
    ])
    return file
  }

  test('exports a collection without personal reading data', async ({
    page,
  }) => {
    const file = await exportList(page)
    expect(file.suggestedFilename()).toBe('cosy-autumn.booklib-list.json')
    const shared = JSON.parse(readFileSync(await file.path(), 'utf8'))
    expect(shared).toMatchObject({
      format: 'booklib-list',
      name: 'Cosy autumn',
    })
    expect(shared.books.map((b: { title: string }) => b.title)).toEqual([
      'Piranesi',
      'The Left Hand of Darkness',
    ])
    for (const book of shared.books) {
      expect(book.rating).toBeNull()
      expect(book.progress.status).toBeNull()
      expect(book.progress.notes).toEqual([])
    }
  })

  test('imports a shared list as a collection, linking books already there', async ({
    page,
    browser,
  }) => {
    const file = await exportList(page)
    const buffer = readFileSync(await file.path())

    // Someone else's library: already has Piranesi and a "Cosy autumn"
    const context = await browser.newContext()
    const other = await context.newPage()
    const theirs = makeBook('Piranesi', { author_id: clarke.id, rating: 3 })
    await seedLibrary(
      other,
      makeDb({
        authors: [clarke],
        books: [theirs],
        collections: [{ ...list, id: 'collection-theirs' }],
      }),
    )
    await other.goto('/data-management')
    await other.getByTestId('import-file-input').setInputFiles({
      name: file.suggestedFilename(),
      mimeType: 'application/json',
      buffer,
    })

    await expect(other.getByTestId('shared-list-name')).toHaveText(
      'Cosy autumn',
    )
    await expect(other.getByTestId('shared-list-info')).toContainText(
      'without a copy',
    )
    await other.getByTestId('import-submit').click()
    await expect(other).toHaveURL(/\/library\/collections\/[^/]+$/)
    await expect(
      other.getByRole('heading', { name: 'Cosy autumn (2)' }),
    ).toBeVisible()

    const db = await readLibrary(other)
    expect(db.books.map((b) => b.title).sort()).toEqual([
      'Piranesi',
      'The Left Hand of Darkness',
    ])
    // Their own Piranesi kept its rating; the new book came without one
    expect(db.books.find((b) => b.id === theirs.id)?.rating).toBe(3)
    const added = db.books.find((b) => b.title === 'The Left Hand of Darkness')!
    expect(added.rating).toBeNull()
    expect(added.notes).toEqual([])

    const imported = db.collections.find((c) => c.name === 'Cosy autumn (2)')!
    const members = db['collection-book']
      .filter((link) => link.collection_id === imported.id)
      .map((link) => link.book_id)
      .sort()
    expect(members).toEqual([added.id, theirs.id].sort())
    await context.close()
  })
})
