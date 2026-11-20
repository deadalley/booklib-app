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

async function openPicker(page: Page) {
  await page.goto('/library/collections/tbr')
  await page.getByRole('button', { name: 'Pick next read' }).click()
  await expect(page.getByTestId('next-read-picker')).toBeVisible()
}

const count = (page: Page) => page.getByTestId('next-read-count')
const pickCard = (page: Page) => page.getByTestId('next-read-pick')
const showMe = (page: Page) =>
  page.getByRole('button', { name: 'Show me my next read' })

test.describe('next read picker', () => {
  test('changing a setting does not pick; the button does', async ({
    page,
  }) => {
    await openPicker(page)
    await expect(page.getByRole('dialog')).toContainText(
      '3 unstarted books in To Be Read',
    )
    await expect(count(page)).toContainText('3 books match')
    await expect(page.getByText('Your queue order counts.')).toBeVisible()

    await page.getByRole('radio', { name: 'Surprise me' }).click()
    await expect(page.getByText('Your queue order counts.')).toBeHidden()
    await expect(pickCard(page)).toBeHidden()

    await showMe(page).click()
    await expect(pickCard(page)).toBeVisible()
    await expect(page.getByTestId('next-read-progress')).toContainText(
      '1 of 3 shown',
    )
  })

  test('filters with a live count, then starts the book', async ({ page }) => {
    await openPicker(page)
    await page.getByRole('button', { name: 'Filters' }).click()
    await page.getByRole('combobox', { name: 'Genre' }).click()
    await page.getByRole('option', { name: 'Science Fiction' }).click()
    await expect(count(page)).toContainText('1 book matches')

    await showMe(page).click()
    await expect(pickCard(page)).toContainText('The Dispossessed')
    await expect(pickCard(page)).toContainText('2nd in your To Be Read')

    await page.getByRole('button', { name: 'Start reading' }).click()
    await expect(page.getByTestId('toast')).toContainText(
      'Started The Dispossessed · Added to Reading',
    )
    expect(
      (await readLibrary(page)).books.find(({ id }) => id === dispossessed.id)
        ?.progress_status,
    ).toBe('reading')
  })

  test('shows every match once, then starts over', async ({ page }) => {
    await openPicker(page)
    await showMe(page).click()
    const progress = page.getByTestId('next-read-progress')
    await expect(progress).toContainText('1 of 3 shown')
    const seen = [await page.locator('.pk-title').textContent()]

    for (const shownCount of [2, 3]) {
      await page.getByRole('button', { name: 'Show me another' }).click()
      await expect(progress).toContainText(`${shownCount} of 3 shown`)
      seen.push(await page.locator('.pk-title').textContent())
    }
    expect(new Set(seen).size).toBe(3)
    await expect(page.getByText('That was every match.')).toBeVisible()

    await page.getByRole('button', { name: 'Start over' }).click()
    await expect(progress).toContainText('1 of 3 shown')
  })

  test('says when settings changed after a pick', async ({ page }) => {
    await openPicker(page)
    await showMe(page).click()
    const title = await page.locator('.pk-title').textContent()

    await page.getByRole('button', { name: 'Change settings' }).click()
    await page.getByRole('radio', { name: 'Surprise me' }).click()
    await page.getByRole('button', { name: `Back to ${title}` }).click()
    await expect(page.getByText('Settings changed.')).toBeVisible()
    await page.getByRole('button', { name: 'Show me a new pick' }).click()
    await expect(page.getByText('Settings changed.')).toBeHidden()
    await expect(page.getByText('Surprise me', { exact: true })).toBeVisible()
  })

  test('says when no books match', async ({ page }) => {
    await openPicker(page)
    await page.getByRole('button', { name: 'Filters' }).click()
    await page.getByRole('combobox', { name: 'Genre' }).click()
    await page.getByRole('option', { name: 'Fantasy' }).click()
    await page.getByRole('combobox', { name: 'Length' }).click()
    await page.getByRole('option', { name: 'Over 450 pages' }).click()

    await expect(page.getByText('No books match these filters')).toBeVisible()
    await expect(
      page.getByText(
        'Nothing unstarted in To Be Read is Fantasy and over 450 pages.',
      ),
    ).toBeVisible()
    await expect(showMe(page)).toBeDisabled()
    await page.getByRole('button', { name: 'Reset filters' }).last().click()
    await expect(count(page)).toContainText('3 books match')
  })

  test('opens from the home page', async ({ page }) => {
    await page.goto('/home')
    await page.getByRole('button', { name: 'What should I read next?' }).click()
    await expect(
      page.getByRole('radiogroup', { name: 'Pick from' }),
    ).toBeVisible()
    await expect(pickCard(page)).toBeHidden()
    await showMe(page).click()
    await expect(pickCard(page)).toBeVisible()
  })
})
