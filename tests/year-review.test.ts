import {
  expect,
  makeBook,
  makeDb,
  makeGoal,
  seedLibrary,
  test,
} from './fixtures'

const year = new Date().getFullYear()
const day = (y: number, md: string) => `${y}-${md}T00:00:00.000Z`

const read = (title: string, y: number, md: string, extra = {}) =>
  makeBook(title, {
    progress_status: 'read',
    started_at: day(y, md),
    finished_at: day(y, md),
    pages: 300,
    ...extra,
  } as never)

test.describe('year in review', () => {
  test('reviews the current year from finished books, logs and goals', async ({
    page,
  }) => {
    await seedLibrary(
      page,
      makeDb({
        books: [
          read('First', year, '01-10', { rating: 4 }),
          read('Second', year, '01-20', {
            rating: 5,
            notes: [
              {
                id: 'n1',
                createdAt: day(year, '01-11'),
                page: 100,
                content: 'A line worth keeping',
              },
              {
                id: 'n2',
                createdAt: day(year, '01-12'),
                page: 220,
                content: '',
              },
            ],
          }),
          read('Last year', year - 1, '06-01'),
        ],
        goals: [makeGoal(`Read 2 books in ${year}`, { amount: 2, auto: true })],
      }),
    )
    await page.goto(`/stats/year/${year}`)

    await expect(
      page.getByRole('heading', { name: `Your ${year} in books` }),
    ).toBeVisible()
    await expect(page.getByText('Year in progress')).toBeVisible()
    const kpis = page.locator('.kpis').first()
    await expect(kpis).toContainText('books finished')
    await expect(kpis).toContainText(`vs ${year - 1}: +1`)
    // 220 pages logged across two days, plus two finish days
    await expect(kpis).toContainText('220')
    await expect(page.getByTestId('year-highlights')).toContainText(
      'You read 1 more book',
    )
    await expect(
      page.getByRole('heading', { name: 'Reading rhythm' }),
    ).toBeVisible()
    await expect(page.getByText('Ranked by your rating.')).toBeVisible()
    await expect(page.getByTestId('year-goals')).toContainText('Completed')
    await expect(page.getByText('“A line worth keeping”')).toBeVisible()

    // The year picker moves to last year's finished review
    await page.getByRole('button', { name: 'Previous year' }).click()
    await expect(page).toHaveURL(new RegExp(`/stats/year/${year - 1}`))
    await expect(
      page.getByText('Year in review', { exact: true }).last(),
    ).toBeVisible()
  })

  test('shows an empty past year and a fresh current year', async ({
    page,
  }) => {
    await seedLibrary(page, makeDb({ books: [read('Old', year - 1, '03-01')] }))
    await page.goto(`/stats/year/${year - 3}`)
    await expect(page.getByTestId('year-empty')).toContainText(
      `Nothing logged in ${year - 3}`,
    )

    await page.goto(`/stats/year/${year}`)
    await expect(page.getByTestId('year-starts-here')).toContainText(
      `Your ${year} starts here`,
    )
    await expect(
      page.getByRole('link', { name: `Your ${year - 1} in review is ready` }),
    ).toBeVisible()
  })

  test('is reachable from home and statistics', async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [read('Done', year, '02-01')] }))
    await page.goto('/home')
    const glimpse = page.getByTestId('home-year-review')
    await expect(glimpse).toContainText(`Your ${year} in books`)
    await glimpse
      .getByRole('link', { name: `See your ${year} in review` })
      .click()
    await expect(page).toHaveURL(new RegExp(`/stats/year/${year}`))

    await page.goto('/stats')
    await page
      .getByRole('link', { name: `Open your ${year} year in review` })
      .click()
    await expect(page).toHaveURL(new RegExp(`/stats/year/${year}`))
  })
})
