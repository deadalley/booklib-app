import { expect, makeBook, makeDb, seedLibrary, test } from './fixtures'

test.describe('finished books', () => {
  test('counts every read book, whatever its logs or finish date', async ({
    page,
  }) => {
    const year = new Date().getFullYear()
    const logged = makeBook('Logged read', {
      progress_status: 'read',
      pages: 300,
      current_page: 40,
      finished_at: null,
      notes: [
        {
          id: 'n1',
          createdAt: `${year}-01-15T00:00:00.000Z`,
          page: 40,
          content: '',
        },
      ],
    } as never)
    const undated = makeBook('Undated read', {
      progress_status: 'read',
      pages: 200,
      finished_at: null,
    } as never)
    await seedLibrary(page, makeDb({ books: [logged, undated] }))

    await page.goto(`/library/books/${logged.id}`)
    await expect(page.locator('.progress-percentage')).toContainText('100')

    await page.goto('/stats')
    const finished = page.locator('.kpi').first()
    // Dated by its last log entry, so it counts this year
    await page.getByRole('radio', { name: 'year', exact: true }).click()
    await expect(finished).toContainText('1')
    // Without any date it still counts all time
    await page.getByRole('radio', { name: 'all', exact: true }).click()
    await expect(finished).toContainText('2')
    await expect(page.getByText('1 read without a date')).toBeVisible()
  })
})
