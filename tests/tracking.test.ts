import type { Page } from '@playwright/test'
import {
  expect,
  makeBook,
  makeDb,
  makeGoal,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const goalDialog = (page: Page) => page.getByRole('dialog', { name: /goal/i })

/** The user's local calendar day, as the app uses for "today". */
async function localToday(page: Page) {
  return page.evaluate(() => {
    const d = new Date()
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
    ].join('-')
  })
}

test.describe('creating goals', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [makeBook('Book 1')] }))
    await page.goto('/tracking')
    await expect(page.getByRole('heading', { name: 'Goals' })).toBeVisible()
  })

  test('creates a yearly total book goal', async ({ page }) => {
    await page.getByRole('button', { name: 'New goal' }).first().click()
    const dialog = goalDialog(page)
    await dialog.getByLabel('Goal title').fill('Read 10 books')
    await dialog.getByLabel('Amount').fill('10')
    await dialog.getByLabel('Of').selectOption({ label: 'Books' })
    await dialog.getByLabel('Every').selectOption({ label: 'in total' })
    await dialog.getByRole('button', { name: 'Create goal' }).click()

    await expect(
      page.getByRole('heading', { name: 'Read 10 books' }),
    ).toBeVisible()
    const [goal] = (await readLibrary(page)).goals
    expect(goal).toMatchObject({
      title: 'Read 10 books',
      amount: 10,
      type: 'books',
      interval: 'total',
    })
  })

  test('validates the title', async ({ page }) => {
    await page.getByRole('button', { name: 'New goal' }).first().click()
    const dialog = goalDialog(page)
    await dialog.getByLabel('Goal title').fill('')
    await dialog.getByRole('button', { name: 'Create goal' }).click()
    await expect(dialog).toBeVisible()
    expect((await readLibrary(page)).goals).toEqual([])
  })
})

test.describe('logging progress', () => {
  const pagesGoal = makeGoal('Read 30 pages a day', {
    type: 'pages',
    interval: 'daily',
    amount: 30,
  })

  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ goals: [pagesGoal] }))
    await page.goto('/tracking')
    await expect(
      page.getByRole('heading', { name: pagesGoal.title }),
    ).toBeVisible()
  })

  test('logs pages for today and keeps the date across later saves', async ({
    page,
  }) => {
    const today = await localToday(page)

    await page.getByRole('button', { name: 'Log pages' }).first().click()
    const dialog = page.getByRole('dialog', { name: /Log pages/ })
    await expect(dialog.getByLabel('Read on')).toHaveValue(today)
    await dialog.getByLabel('Pages').fill('35')
    await dialog.getByRole('button', { name: 'Log pages' }).click()

    const entryDate = async () =>
      (await readLibrary(page)).goals[0]?.entries.map((e) => e.created_at)
    await expect.poll(entryDate).toEqual([`${today}T00:00:00.000Z`])

    // Saving the goal again (pause, resume) must not move the entry's day
    await page.getByRole('button', { name: 'Pause' }).click()
    await expect
      .poll(async () => (await readLibrary(page)).goals[0]?.status)
      .toBe('not-tracking')
    await page.getByRole('button', { name: 'Resume' }).click()
    await expect
      .poll(async () => (await readLibrary(page)).goals[0]?.status)
      .toBe('tracking')
    expect(await entryDate()).toEqual([`${today}T00:00:00.000Z`])
  })

  test('deletes a goal', async ({ page }) => {
    await page.getByRole('button', { name: 'Delete goal' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete' })
      .click()
    await expect.poll(async () => (await readLibrary(page)).goals).toEqual([])
    await expect(
      page.getByRole('heading', { name: pagesGoal.title }),
    ).toHaveCount(0)
  })
})

test.describe('time zones', () => {
  for (const timezoneId of ['America/Los_Angeles', 'Pacific/Auckland']) {
    test.describe(timezoneId, () => {
      test.use({ timezoneId })

      test(`logged entries stay on their day (${timezoneId})`, async ({
        page,
      }) => {
        const goal = makeGoal('Read 30 pages a day', {
          type: 'pages',
          interval: 'daily',
          amount: 30,
        })
        await seedLibrary(page, makeDb({ goals: [goal] }))
        await page.goto('/tracking')
        const today = await localToday(page)

        await page.getByRole('button', { name: 'Log pages' }).first().click()
        const dialog = page.getByRole('dialog', { name: /Log pages/ })
        await dialog.getByLabel('Pages').fill('10')
        await dialog.getByRole('button', { name: 'Log pages' }).click()
        await page.getByRole('button', { name: 'Pause' }).click()
        await page.getByRole('button', { name: 'Resume' }).click()

        await expect
          .poll(async () =>
            (await readLibrary(page)).goals[0]?.entries.map(
              (e) => e.created_at,
            ),
          )
          .toEqual([`${today}T00:00:00.000Z`])
      })
    })
  }
})
