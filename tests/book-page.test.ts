import type { Page } from '@playwright/test'
import {
  expect,
  makeAuthor,
  makeBook,
  makeDb,
  makeGoal,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const author = makeAuthor('Susanna Clarke')
const reading = makeBook('Piranesi', {
  author_id: author.id,
  pages: 272,
  progress_status: 'reading',
  started_at: '2024-02-01T00:00:00.000Z',
  genres: ['Fantasy', 'Mystery'],
})
const autoGoal = makeGoal('Read 12 books this year', {
  amount: 12,
  auto: true,
})

const storedBook = async (page: Page) =>
  (await readLibrary(page)).books.find((b) => b.id === reading.id)!

const logModal = (page: Page) =>
  page.getByRole('dialog', { name: /Log Reading Entry|Edit Log Entry/ })

test.beforeEach(async ({ page }) => {
  await seedLibrary(
    page,
    makeDb({ authors: [author], books: [reading], goals: [autoGoal] }),
  )
  await page.goto(`/library/books/${reading.id}`)
  await expect(
    page.getByRole('heading', { name: 'Piranesi', level: 1 }),
  ).toBeVisible()
})

test('a logged page is kept after reloading', async ({ page }) => {
  await page.getByRole('button', { name: 'Log entry' }).click()
  await logModal(page).getByLabel('Page reached').fill('120')
  await logModal(page).getByRole('button', { name: 'Save Entry' }).click()

  await expect.poll(async () => (await storedBook(page)).current_page).toBe(120)

  await page.reload()
  // 120 of 272 pages: read and left come from the logged page exactly
  await expect(page.locator('.progress-percentage')).toHaveText(/^\s*44\s*%/)
  const stats = page.locator('.progress-stats')
  await expect(stats).toContainText('120')
  await expect(stats).toContainText('152')
})

test('a note without a page is saved as a log entry', async ({ page }) => {
  await page.getByRole('button', { name: 'Log entry' }).click()
  await logModal(page).getByLabel('Note (optional)').fill('The statues again')
  await logModal(page).getByRole('button', { name: 'Save Entry' }).click()

  await expect
    .poll(async () => (await storedBook(page)).notes.map((n) => n.content))
    .toEqual(['The statues again'])
  await expect(page.getByText('The statues again')).toBeVisible()
})

test('finishing a book records the date and counts toward automatic goals', async ({
  page,
}) => {
  await expect(page.getByText(autoGoal.title)).toHaveCount(0)

  await page.getByRole('button', { name: 'Finish' }).click()
  await page.getByRole('button', { name: 'Finished the book' }).click()

  await expect
    .poll(async () => (await storedBook(page)).progress_status)
    .toBe('read')
  expect((await storedBook(page)).finished_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)

  // The automatic goal now counts this book and is linked on its page
  await expect(page.getByText(autoGoal.title)).toBeVisible()

  // Marking it unread clears the progress again
  await page.getByRole('button', { name: 'Mark as unread' }).click()
  await expect
    .poll(async () => (await storedBook(page)).progress_status)
    .toBeNull()
  expect(await storedBook(page)).toMatchObject({
    finished_at: null,
    started_at: null,
  })
})

test('genres can be removed and added in edit mode', async ({ page }) => {
  const tags = page.getByTestId('genre-tag')
  await expect(tags).toHaveText(['Fantasy', 'Mystery'])

  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('button', { name: 'Remove Mystery' }).click()
  const add = page.getByRole('textbox', { name: 'Add genre' })
  await add.fill('Magical realism')
  await add.press('Enter')
  await expect(tags).toHaveText(['Fantasy', 'Magical realism'])

  await page.getByRole('button', { name: 'Save changes' }).first().click()
  await expect
    .poll(async () => (await storedBook(page)).genres)
    .toEqual(['Fantasy', 'Magical realism'])
  // Saving the genres did not touch any other field
  expect(await storedBook(page)).toMatchObject({
    author_id: author.id,
    pages: 272,
    progress_status: 'reading',
  })
})
