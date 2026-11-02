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

const VIEWPORTS = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1536, height: 900 },
] as const

const author = makeAuthor('A very long author name for wrapping checks')
const books = Array.from({ length: 30 }, (_, index) =>
  makeBook(`A rather long book title number ${index + 1}`, {
    author_id: author.id,
    language: index % 2 ? 'en' : 'es',
    publisher: `Publisher ${index % 4}`,
    year: 1950 + index,
    rating: (index % 5) + 1,
    genres: [`Genre ${index % 3}`],
    progress_status: index % 3 ? 'read' : 'reading',
    finished_at: index % 3 ? `2024-0${(index % 9) + 1}-15T00:00:00.000Z` : null,
  }),
)
const library = makeDb({
  authors: [author],
  books,
  goals: [makeGoal('Read 24 books this year', { amount: 24, auto: true })],
})

const ROUTES = [
  '/home',
  '/library/books',
  '/library/books?view=table',
  '/library/collections',
  '/library/authors',
  `/library/books/${books[0]!.id}`,
  '/stats',
  '/tracking',
  '/data-management',
  '/settings',
]

/** Elements (other than intentional scrollers) that stick out of the page. */
async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
    }
  })
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    test.beforeEach(async ({ page }) => {
      await seedLibrary(page, library)
    })

    for (const route of ROUTES) {
      test(`${route} does not scroll sideways`, async ({ page }, testInfo) => {
        await page.goto(route)
        await expect(page.locator('nav.nav-sidebar')).toBeVisible()
        await expect(page.locator('main h3, main h1').first()).toBeVisible()
        // Let charts and images settle their final size
        await page.waitForTimeout(300)

        const { scrollWidth, clientWidth } = await horizontalOverflow(page)
        expect(
          scrollWidth,
          `${route} overflows horizontally`,
        ).toBeLessThanOrEqual(clientWidth)

        await testInfo.attach(
          `${viewport.width}${route.replace(/[/?=]/g, '_')}`,
          {
            body: await page.screenshot(),
            contentType: 'image/png',
          },
        )
      })
    }

    test('every navigation item is reachable', async ({ page }) => {
      await page.goto('/home')
      for (const label of [
        'Home',
        'Library',
        'Statistics',
        'Tracking',
        'Data',
        'Settings',
      ]) {
        const link = page
          .locator('nav.nav-sidebar')
          .getByRole('link', { name: label })
          .first()
        await expect(link).toBeInViewport()
      }
    })

    test('the filter panel is on screen after scrolling the list', async ({
      page,
    }) => {
      await page.goto('/library/books')
      await expect(page.locator('.book-tile').first()).toBeVisible()

      // Phones collapse the toolbar behind a toggle
      const filter = page.getByRole('button', { name: 'Filter' }).first()
      if (!(await filter.isVisible())) {
        await page.getByRole('button', { name: 'Show actions' }).click()
      }
      await page.mouse.wheel(0, 3000)
      await filter.click()

      const panel = page.getByRole('dialog', { name: 'Filter' })
      await expect(panel).toBeInViewport({ ratio: 0.9 })
      const box = (await panel.boundingBox())!
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1)
    })

    test('modals fit inside the viewport', async ({ page }) => {
      await page.goto('/tracking')
      await page.getByRole('button', { name: 'New goal' }).first().click()
      const dialog = page.getByRole('dialog', { name: /goal/i })
      await expect(dialog).toBeVisible()
      const box = (await dialog.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
      // Long forms scroll inside the modal instead of being cut off
      await dialog
        .getByRole('button', { name: 'Create goal' })
        .scrollIntoViewIfNeeded()
      await expect(
        dialog.getByRole('button', { name: 'Create goal' }),
      ).toBeInViewport()
    })
  })
}

test.describe('sidebar', () => {
  test('collapses below xl and can still be expanded', async ({ page }) => {
    await seedLibrary(page, library)
    await page.setViewportSize({ width: 1100, height: 800 })
    await page.goto('/home')
    const nav = page.locator('nav.nav-sidebar')
    await expect(nav).toHaveAttribute('data-state', 'collapsed')

    await page.getByRole('button', { name: 'Expand sidebar' }).click()
    await expect(nav).toHaveAttribute('data-state', 'expanded')

    await page.setViewportSize({ width: 1440, height: 800 })
    await expect(nav).toHaveAttribute('data-state', 'expanded')
  })

  test('follows the window size until toggled', async ({ page }) => {
    await seedLibrary(page, library)
    await page.setViewportSize({ width: 1440, height: 800 })
    await page.goto('/home')
    const nav = page.locator('nav.nav-sidebar')
    await expect(nav).toHaveAttribute('data-state', 'expanded')
    await page.setViewportSize({ width: 1000, height: 800 })
    await expect(nav).toHaveAttribute('data-state', 'collapsed')
  })
})
