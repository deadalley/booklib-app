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

const year = new Date().getFullYear()
const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

const leGuin = makeAuthor('Ursula K. Le Guin')
const chiang = makeAuthor('Ted Chiang')

const library = makeDb({
  authors: [leGuin, chiang],
  books: [
    makeBook('Piranesi', {
      progress_status: 'reading',
      pages: 272,
      current_page: 245,
      started_at: daysAgo(10),
      created_at: daysAgo(40),
    }),
    makeBook('The Dispossessed', {
      author_id: leGuin.id,
      progress_status: 'read',
      rating: 5,
      finished_at: daysAgo(3),
      created_at: daysAgo(300),
    }),
    makeBook('A Wizard of Earthsea', {
      author_id: leGuin.id,
      pages: 183,
      genres: ['Fantasy'],
      created_at: daysAgo(800),
    }),
    makeBook('Exhalation', {
      author_id: chiang.id,
      created_at: daysAgo(2),
    }),
  ],
  goals: [makeGoal(`Read 12 books in ${year}`, { amount: 12 })],
})

const carousel = (page: Page) =>
  page.getByRole('region', { name: 'Suggestions' })

/** The suggestion currently on screen. */
const currentSlide = (page: Page) =>
  carousel(page).locator('article[aria-hidden="false"]')

async function showSlide(page: Page, text: string | RegExp) {
  for (let i = 0; i < 10; i++) {
    if (await currentSlide(page).getByText(text).isVisible()) return
    await carousel(page)
      .getByRole('button', { name: 'Next suggestion' })
      .click()
  }
  throw new Error(`No suggestion matching ${text}`)
}

test.describe('home', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, library)
    await page.goto('/home')
    await expect(page.getByRole('heading', { name: /^Good / })).toBeVisible()
  })

  test('shows every section', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Add book', exact: true }),
    ).toHaveAttribute('href', '/library/books/new')

    const libraryNav = page.getByRole('navigation', { name: 'Library' })
    await expect(
      libraryNav.getByRole('link', { name: /4\s*Books\s*1 reading now/ }),
    ).toBeVisible()
    await expect(
      libraryNav.getByRole('link', { name: /3\s*Collections\s*0 of your own/ }),
    ).toBeVisible()
    await expect(
      libraryNav.getByRole('link', { name: /2\s*Authors/ }),
    ).toBeVisible()

    const continueReading = page.getByRole('region', {
      name: 'Continue reading',
    })
    await expect(continueReading.getByText('Piranesi')).toBeVisible()
    await expect(continueReading.getByText('90%')).toBeVisible()
    await expect(continueReading.getByText('27 left')).toBeVisible()

    const goals = page.getByRole('region', { name: 'Goals' })
    await expect(goals.getByText(`Read 12 books in ${year}`)).toBeVisible()

    const stats = page.getByRole('region', { name: `Your ${year} so far` })
    await expect(stats.getByText('books finished')).toBeVisible()
    await expect(stats.getByText('5.0')).toBeVisible()

    const recent = page.getByRole('region', { name: 'Recently added' })
    const tiles = recent.getByRole('link', { name: /Added/ })
    await expect(tiles).toHaveCount(4)
    await expect(tiles.first()).toContainText('Added 2 days ago')
  })

  test('orders the suggestions by kind', async ({ page }) => {
    const slides = carousel(page).locator('article')
    await expect(slides).toHaveCount(5)
    await expect(slides.nth(0)).toContainText('Almost there')
    await expect(slides.nth(1)).toContainText('Goal')
    await expect(slides.nth(2)).toContainText('From an author you like')
    await expect(slides.nth(3)).toContainText('On your shelf')
    await expect(carousel(page).getByText('1 / 5')).toBeVisible()
  })

  test('changes slides with the arrow keys', async ({ page }) => {
    await currentSlide(page).getByRole('button', { name: 'Not now' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(carousel(page).getByText('2 / 5')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(carousel(page).getByText('5 / 5')).toBeVisible()
  })

  test('"Not now" hides a suggestion across reloads', async ({ page }) => {
    await currentSlide(page).getByRole('button', { name: 'Not now' }).click()
    await expect(carousel(page).locator('article')).toHaveCount(4)
    await page.reload()
    await expect(carousel(page).locator('article')).toHaveCount(4)
    await expect(carousel(page)).not.toContainText('Almost there')
  })

  test('starts reading a book from the shelf', async ({ page }) => {
    await showSlide(page, /A Wizard of Earthsea has been in your library/)
    await currentSlide(page)
      .getByRole('button', { name: 'Start reading' })
      .click()
    await expect(page.getByRole('status')).toContainText(
      'Started A Wizard of Earthsea',
    )

    const stored = (await readLibrary(page)).books.find(
      ({ title }) => title === 'A Wizard of Earthsea',
    )!
    expect(stored.progress_status).toBe('reading')
    expect(stored.started_at).toBeTruthy()
    await expect(
      page
        .getByRole('region', { name: 'Continue reading' })
        .getByText('A Wizard of Earthsea'),
    ).toBeVisible()
  })

  test('logs a finished book for a goal', async ({ page }) => {
    await showSlide(page, /Log The Dispossessed/)
    await currentSlide(page).getByRole('button', { name: 'Log book' }).click()
    await expect(page.getByRole('status')).toContainText(
      'Logged The Dispossessed',
    )
    const goal = (await readLibrary(page)).goals[0]!
    expect(goal.entries).toHaveLength(1)
    await expect(carousel(page)).not.toContainText('Log The Dispossessed')
  })

  test('goal rows deep-link to the goal on the tracking page', async ({
    page,
  }) => {
    await page
      .getByRole('region', { name: 'Goals' })
      .getByRole('link', { name: new RegExp(`Read 12 books in ${year}`) })
      .click()
    await expect(page).toHaveURL(/\/tracking#goal-/)
  })
})

test('shows the empty states', async ({ page }) => {
  await seedLibrary(
    page,
    makeDb({ books: [makeBook('Read already', { progress_status: 'read' })] }),
  )
  await page.goto('/home')
  await expect(
    page.getByText('You’re all caught up. No suggestions right now.'),
  ).toBeVisible()
  await expect(
    page.getByText(
      'Nothing in progress. Pick something from the suggestions above.',
    ),
  ).toBeVisible()
  await expect(page.getByText('No active goals.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Set a goal' })).toHaveAttribute(
    'href',
    '/tracking/new',
  )
})
