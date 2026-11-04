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

/** "New goal" opens the flow at step 1; continue to the custom goal form. */
async function openCustomGoal(page: Page) {
  await page.getByRole('button', { name: 'New goal' }).first().click()
  await page.getByTestId('path-custom').click()
}

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
    await openCustomGoal(page)
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
    await openCustomGoal(page)
    const dialog = goalDialog(page)
    await dialog.getByLabel('Goal title').fill('')
    await dialog.getByRole('button', { name: 'Create goal' }).click()
    await expect(dialog).toBeVisible()
    expect((await readLibrary(page)).goals).toEqual([])
  })
})

test.describe('challenges', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [makeBook('Book 1')] }))
    await page.goto('/tracking')
    await expect(page.getByTestId('goals-empty')).toBeVisible()
  })

  test('starts a challenge from the new goal flow', async ({ page }) => {
    await page.getByRole('button', { name: 'New goal' }).first().click()
    await page.getByTestId('path-challenge').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Choose a challenge')).toBeVisible()
    await dialog.getByRole('radio', { name: 'Moderate' }).click()
    await expect(dialog.getByTestId('challenge-52-books')).toBeHidden()
    await dialog.getByTestId('challenge-30-day').click()

    const review = dialog.getByTestId('challenge-review')
    await expect(review.getByLabel('Name')).toHaveValue('30-day streak')
    await expect(review.getByTestId('challenge-pace')).toContainText(
      '20 pages every day',
    )
    await expect(review.getByText('Matches the preset')).toBeVisible()
    await review.getByLabel(/^Target/).fill('30')
    await expect(review.getByText('Tougher than the preset')).toBeVisible()
    await review.getByRole('button', { name: 'Accept challenge' }).click()

    await expect(
      page.getByRole('heading', { name: '30-day streak' }),
    ).toBeVisible()
    await expect(page.getByTitle('Moderate challenge')).toBeVisible()
    const [goal] = (await readLibrary(page)).goals
    expect(goal).toMatchObject({
      title: '30-day streak',
      type: 'pages',
      interval: 'daily',
      amount: 30,
      challenge: '30-day',
      level: 1,
    })
    // A live challenge hides the call-out
    await expect(page.getByTestId('challenge-callout')).toBeHidden()
    await expect(page.getByTestId('goals-overview')).toBeVisible()
  })

  test('validates the review step', async ({ page }) => {
    await page
      .getByTestId('challenge-callout')
      .getByTestId('challenge-1000-pages')
      .click()
    const review = page.getByTestId('challenge-review')
    await review.getByLabel('Name').fill('')
    await review.getByRole('button', { name: 'Accept challenge' }).click()
    await expect(review.getByText('Give your challenge a name')).toBeVisible()
    expect((await readLibrary(page)).goals).toEqual([])
  })

  test('dismisses the call-out for good', async ({ page }) => {
    const callout = page.getByTestId('challenge-callout')
    await callout.getByRole('button', { name: 'Dismiss challenges' }).click()
    await expect(callout).toBeHidden()
    await page.reload()
    await expect(page.getByTestId('goals-empty')).toBeVisible()
    await expect(callout).toBeHidden()
  })
})

test.describe('goals overview', () => {
  test('summarizes goals and jumps to the next deadline', async ({ page }) => {
    const soon = makeGoal('Finish soon', { amount: 5 })
    await seedLibrary(page, makeDb({ goals: [soon] }))
    await page.goto('/tracking')

    const overview = page.getByTestId('goals-overview')
    await expect(overview).toContainText('Average across 1 active goal')
    await overview.getByRole('button', { name: /Finish soon/ }).click()
    await expect(page.locator(`#goal-${soon.id}`)).toBeInViewport()
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
