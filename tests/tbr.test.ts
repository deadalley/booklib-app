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
const earthsea = makeBook('A Wizard of Earthsea', {
  author_id: leGuin.id,
  genres: ['Fantasy'],
  pages: 180,
})
const dispossessed = makeBook('The Dispossessed', {
  author_id: leGuin.id,
  genres: ['Science Fiction'],
  pages: 387,
})
const kindred = makeBook('Kindred', { genres: ['Historical'], pages: 264 })

const library = makeDb({
  authors: [leGuin],
  books: [earthsea, dispossessed, kindred],
  'collection-book': [
    { book_id: earthsea.id, collection_id: 'tbr', order: 0 },
    { book_id: dispossessed.id, collection_id: 'tbr', order: 1 },
    { book_id: kindred.id, collection_id: 'tbr', order: 2 },
  ],
})

const tbrOrder = async (page: Page) =>
  (await readLibrary(page))['collection-book']
    .filter(({ collection_id }) => collection_id === 'tbr')
    .sort((a, b) => a.order - b.order)
    .map(({ book_id }) => book_id)

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await seedLibrary(page, library)
})

test('reorders the To Be Read queue with the keyboard', async ({ page }) => {
  await page.goto('/library/collections/tbr')
  await page.getByRole('button', { name: 'Reorder' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'the order you want' }),
  ).toBeVisible()

  const handle = page.getByRole('button', { name: /^Move Kindred/ })
  await handle.focus()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(
    page.getByRole('button', { name: 'Move Kindred, position 1' }),
  ).toBeFocused()

  await expect
    .poll(() => tbrOrder(page))
    .toEqual([kindred.id, earthsea.id, dispossessed.id])
  await page.getByRole('button', { name: 'Done' }).click()

  await page.reload()
  await expect(page.locator('.book-tile').first()).toContainText('Kindred')
})

test('reorders a collection by dragging with the mouse', async ({ page }) => {
  // Tall enough that the whole grid is on screen
  await page.setViewportSize({ width: 1280, height: 1600 })
  await page.goto('/library/collections/tbr')
  await page.getByRole('button', { name: 'Reorder' }).click()
  const tiles = page.getByTestId('reorder-grid').locator('.book-tile')
  const from = (await tiles
    .nth(2)
    .getByRole('button', { name: /^Move Kindred/ })
    .boundingBox())!
  const to = (await tiles.nth(0).boundingBox())!

  await page.mouse.move(from.x + 10, from.y + 5)
  await page.mouse.down()
  // Sortable needs a few moves to start dragging and find the drop spot
  for (let step = 1; step <= 20; step++) {
    await page.mouse.move(
      from.x + 10 + ((to.x + 20 - from.x - 10) * step) / 20,
      from.y + 5 + ((to.y + 40 - from.y - 5) * step) / 20,
    )
    await page.waitForTimeout(30)
  }
  await page.mouse.up()

  await expect(tiles.first()).toContainText('Kindred')
  await expect
    .poll(() => tbrOrder(page))
    .toEqual([kindred.id, earthsea.id, dispossessed.id])
})

test('suggests the top of the queue on the home page', async ({ page }) => {
  await page.goto('/home')
  await expect(
    page.getByRole('heading', {
      name: 'A Wizard of Earthsea is next on your To Be Read',
    }),
  ).toBeVisible()
})

test('picks a next read from the collection, with filters', async ({
  page,
}) => {
  await page.goto('/library/collections/tbr')
  await page.getByRole('button', { name: 'Pick next read' }).click()
  const picker = page.getByTestId('next-read-picker')
  await expect(page.getByRole('dialog')).toContainText(
    '3 books to choose from in To Be Read',
  )
  await expect(page.getByTestId('next-read-pick')).toBeVisible()

  await picker.getByRole('combobox', { name: 'Genre' }).click()
  await page.getByRole('option', { name: 'Science Fiction' }).click()
  const pick = page.getByTestId('next-read-pick')
  await expect(pick).toContainText('The Dispossessed')
  await expect(pick).toContainText('#2 on your To Be Read')

  await pick.getByRole('button', { name: 'Start reading' }).click()
  await expect(page.getByTestId('toast')).toContainText(
    'Started The Dispossessed',
  )
  expect(
    (await readLibrary(page)).books.find(({ id }) => id === dispossessed.id)
      ?.progress_status,
  ).toBe('reading')
})

test('picks a next read from the home page', async ({ page }) => {
  await page.goto('/home')
  await page.getByRole('button', { name: 'What should I read next?' }).click()
  const picker = page.getByTestId('next-read-picker')
  await expect(
    picker.getByRole('radiogroup', { name: 'Pick from' }),
  ).toBeVisible()
  await expect(page.getByTestId('next-read-pick')).toBeVisible()
})
