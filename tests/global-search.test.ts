import type { Page } from '@playwright/test'
import {
  expect,
  makeAuthor,
  makeBook,
  makeDb,
  makeGoal,
  seedLibrary,
  test,
} from './fixtures'

const author = makeAuthor('Ursula K. Le Guin')
const book = makeBook('The Left Hand of Darkness', {
  author_id: author.id,
  isbn: '978-0-441-47812-5',
  publisher: 'Ace Books',
  original_title: 'Left Hand',
  notes: [
    {
      id: 'n1',
      createdAt: '2026-03-02T00:00:00.000Z',
      page: 120,
      content: 'The ice is the whole argument',
    },
  ],
} as never)
const goal = makeGoal('Read 24 books this year', { amount: 24 })

const searchInput = (page: Page) =>
  page.getByRole('combobox', { name: /^Search books, authors/ })

test.describe('global search', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await seedLibrary(
      page,
      makeDb({ authors: [author], books: [book], goals: [goal] }),
    )
    await page.goto('/home')
    await expect(searchInput(page)).toBeVisible()
  })

  test('finds a book by ISBN and says why it matched', async ({ page }) => {
    await searchInput(page).fill('9780441478125')
    const result = page.getByRole('option', {
      name: /The Left Hand of Darkness/,
    })
    await expect(result).toContainText('Matches ISBN 9780441478125')
    await result.click()
    await expect(page).toHaveURL(new RegExp(`/library/books/${book.id}`))
  })

  test('focuses with Ctrl+K and finds notes and goals', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(searchInput(page)).toBeFocused()

    await page.keyboard.type('whole argument')
    const note = page.getByRole('option', { name: /The ice is the whole/ })
    await expect(note).toContainText('The Left Hand of Darkness · p. 120')
    await note.click()
    await expect(page).toHaveURL(new RegExp(`/library/books/${book.id}`))

    await searchInput(page).fill('24 books')
    await page.getByRole('option', { name: /Read 24 books this year/ }).click()
    await expect(page).toHaveURL(new RegExp(`/tracking#goal-${goal.id}`))
  })

  test('matches without accents or case', async ({ page }) => {
    await searchInput(page).fill('LE GUIN')
    await expect(
      page.getByRole('option', { name: /The Left Hand of Darkness/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', { name: /^Ursula K\. Le Guin/ }),
    ).toBeVisible()
  })
})
