import { test, expect } from '@playwright/test'
import {
  createBookEntry,
  createFirstGoalEntry,
  createGoal,
  createHourEntry,
  createNewGoalEntry,
  createPageEntry,
  deleteGoal,
  setAmount,
  setAsActive,
  setDateRangeDates,
  setInterval,
  setTitle,
  setType,
} from './tracking.utils'

test.describe('create goal', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/tracking')
  })

  test.describe('books', async () => {
    test.afterEach(async ({ page }) => {
      await deleteGoal(page)
    })

    test('total', async ({ page }) => {
      const goalTitle = '10 books in total in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Books')
      await setInterval(page, 'in total')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createBookEntry(page, 'Book 1')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 2')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 3')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const chart = await page.getByLabel('Progress').getByRole('img')

      await expect(chart).toContainText('Jan 2025')
      await expect(chart).toContainText('Jul 2025')
      await expect(chart).toContainText('3')
      await expect(chart).toContainText('Dec 2025')
      await expect(chart).toContainText('10')
    })

    test('by year', async ({ page }) => {
      const goalTitle = '10 books per year in two years'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Books')
      await setInterval(page, 'per year')
      await setDateRangeDates(page, '2025-01-01', '2026-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2026')

      await createFirstGoalEntry(page)
      await createBookEntry(page, 'Book 1', '2025-02-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 2', '2026-02-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 1, 2026')
    })

    test('by month', async ({ page }) => {
      const goalTitle = '10 books per month in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Books')
      await setInterval(page, 'per month')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createBookEntry(page, 'Book 1', '2025-01-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 2', '2025-06-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 3', '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Feb 1, 2025')
      await expect(xAxisLabels).toContainText('Mar 1, 2025')
      await expect(xAxisLabels).toContainText('Apr 1, 2025')
      await expect(xAxisLabels).toContainText('May 1, 2025')
      await expect(xAxisLabels).toContainText('Jun 1, 2025')
      await expect(xAxisLabels).toContainText('Jul 1, 2025')
      await expect(xAxisLabels).toContainText('Aug 1, 2025')
      await expect(xAxisLabels).toContainText('Sep 1, 2025')
      await expect(xAxisLabels).toContainText('Oct 1, 2025')
      await expect(xAxisLabels).toContainText('Nov 1, 2025')
      await expect(xAxisLabels).toContainText('Dec 1, 2025')
    })

    test('by week', async ({ page }) => {
      const goalTitle = '10 books per week in a month'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Books')
      await setInterval(page, 'per week')
      await setDateRangeDates(page, '2025-01-01', '2025-01-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 31, 2025')

      await createFirstGoalEntry(page)
      await createBookEntry(page, 'Book 1', '2025-01-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 2', '2025-06-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 3', '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 8, 2025')
      await expect(xAxisLabels).toContainText('Jan 15, 2025')
      await expect(xAxisLabels).toContainText('Jan 22, 2025')
      await expect(xAxisLabels).toContainText('Jan 29, 2025')
    })

    test('by day', async ({ page }) => {
      const goalTitle = '10 books per day in a week'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Books')
      await setInterval(page, 'per day')
      await setDateRangeDates(page, '2025-01-01', '2025-01-07')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 7, 2025')

      await createFirstGoalEntry(page)
      await createBookEntry(page, 'Book 1', '2025-01-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 2', '2025-06-01')
      await createNewGoalEntry(page)
      await createBookEntry(page, 'Book 3', '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 2, 2025')
      await expect(xAxisLabels).toContainText('Jan 3, 2025')
      await expect(xAxisLabels).toContainText('Jan 4, 2025')
      await expect(xAxisLabels).toContainText('Jan 5, 2025')
      await expect(xAxisLabels).toContainText('Jan 6, 2025')
      await expect(xAxisLabels).toContainText('Jan 7, 2025')
    })
  })

  test.describe('pages', async () => {
    test.afterEach(async ({ page }) => {
      await deleteGoal(page)
    })

    test('total', async ({ page }) => {
      const goalTitle = '800 pages in total in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 800)
      await setType(page, 'Pages')
      await setInterval(page, 'in total')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createPageEntry(page, 300, '2025-01-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 300, '2025-07-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const chart = await page.getByLabel('Progress').getByRole('img')

      await expect(chart).toContainText('Jan 2025')
      await expect(chart).toContainText('Jul 2025')
      await expect(chart).toContainText('600')
      await expect(chart).toContainText('Dec 2025')
      await expect(chart).toContainText('800')
    })

    test('by year', async ({ page }) => {
      const goalTitle = '800 pages per year in two years'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 800)
      await setType(page, 'Pages')
      await setInterval(page, 'per year')
      await setDateRangeDates(page, '2025-01-01', '2026-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2026')

      await createFirstGoalEntry(page)
      await createPageEntry(page, 300, '2025-01-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 300, '2025-06-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 1, 2026')
    })

    test('by month', async ({ page }) => {
      const goalTitle = '80 pages per month in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 80)
      await setType(page, 'Pages')
      await setInterval(page, 'per month')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createPageEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Feb 1, 2025')
      await expect(xAxisLabels).toContainText('Mar 1, 2025')
      await expect(xAxisLabels).toContainText('Apr 1, 2025')
      await expect(xAxisLabels).toContainText('May 1, 2025')
      await expect(xAxisLabels).toContainText('Jun 1, 2025')
      await expect(xAxisLabels).toContainText('Jul 1, 2025')
      await expect(xAxisLabels).toContainText('Aug 1, 2025')
      await expect(xAxisLabels).toContainText('Sep 1, 2025')
      await expect(xAxisLabels).toContainText('Oct 1, 2025')
      await expect(xAxisLabels).toContainText('Nov 1, 2025')
      await expect(xAxisLabels).toContainText('Dec 1, 2025')
    })

    test('by week', async ({ page }) => {
      const goalTitle = '10 pages per week in a month'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Pages')
      await setInterval(page, 'per week')
      await setDateRangeDates(page, '2025-01-01', '2025-01-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 31, 2025')

      await createFirstGoalEntry(page)
      await createPageEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 8, 2025')
      await expect(xAxisLabels).toContainText('Jan 15, 2025')
      await expect(xAxisLabels).toContainText('Jan 22, 2025')
      await expect(xAxisLabels).toContainText('Jan 29, 2025')
    })

    test('by day', async ({ page }) => {
      const goalTitle = '10 pages per day in a week'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Pages')
      await setInterval(page, 'per day')
      await setDateRangeDates(page, '2025-01-01', '2025-01-07')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 7, 2025')

      await createFirstGoalEntry(page)
      await createPageEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createPageEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 2, 2025')
      await expect(xAxisLabels).toContainText('Jan 3, 2025')
      await expect(xAxisLabels).toContainText('Jan 4, 2025')
      await expect(xAxisLabels).toContainText('Jan 5, 2025')
      await expect(xAxisLabels).toContainText('Jan 6, 2025')
      await expect(xAxisLabels).toContainText('Jan 7, 2025')
    })
  })

  test.describe('hours', async () => {
    test.afterEach(async ({ page }) => {
      await deleteGoal(page)
    })

    test('total', async ({ page }) => {
      const goalTitle = '800 hours in total in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 800)
      await setType(page, 'Hours')
      await setInterval(page, 'in total')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createHourEntry(page, 300, '2025-01-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 300, '2025-07-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const chart = await page.getByLabel('Progress').getByRole('img')

      await expect(chart).toContainText('Jan 2025')
      await expect(chart).toContainText('Jul 2025')
      await expect(chart).toContainText('600')
      await expect(chart).toContainText('Dec 2025')
      await expect(chart).toContainText('800')
    })

    test('by year', async ({ page }) => {
      const goalTitle = '800 hours per year in two years'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 800)
      await setType(page, 'Hours')
      await setInterval(page, 'per year')
      await setDateRangeDates(page, '2025-01-01', '2026-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2026')

      await createFirstGoalEntry(page)
      await createHourEntry(page, 300, '2025-01-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 300, '2025-06-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 1, 2026')
    })

    test('by month', async ({ page }) => {
      const goalTitle = '80 hours per month in a year'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 80)
      await setType(page, 'Hours')
      await setInterval(page, 'per month')
      await setDateRangeDates(page, '2025-01-01', '2025-12-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('December 31, 2025')

      await createFirstGoalEntry(page)
      await createHourEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Feb 1, 2025')
      await expect(xAxisLabels).toContainText('Mar 1, 2025')
      await expect(xAxisLabels).toContainText('Apr 1, 2025')
      await expect(xAxisLabels).toContainText('May 1, 2025')
      await expect(xAxisLabels).toContainText('Jun 1, 2025')
      await expect(xAxisLabels).toContainText('Jul 1, 2025')
      await expect(xAxisLabels).toContainText('Aug 1, 2025')
      await expect(xAxisLabels).toContainText('Sep 1, 2025')
      await expect(xAxisLabels).toContainText('Oct 1, 2025')
      await expect(xAxisLabels).toContainText('Nov 1, 2025')
      await expect(xAxisLabels).toContainText('Dec 1, 2025')
    })

    test('by week', async ({ page }) => {
      const goalTitle = '10 hours per week in a month'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Hours')
      await setInterval(page, 'per week')
      await setDateRangeDates(page, '2025-01-01', '2025-01-31')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 31, 2025')

      await createFirstGoalEntry(page)
      await createHourEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 8, 2025')
      await expect(xAxisLabels).toContainText('Jan 15, 2025')
      await expect(xAxisLabels).toContainText('Jan 22, 2025')
      await expect(xAxisLabels).toContainText('Jan 29, 2025')
    })

    test('by day', async ({ page }) => {
      const goalTitle = '10 hours per day in a week'
      await page.getByText('Goal', { exact: true }).click()

      await setTitle(page, goalTitle)
      await setAsActive(page)
      await setAmount(page, 10)
      await setType(page, 'Hours')
      await setInterval(page, 'per day')
      await setDateRangeDates(page, '2025-01-01', '2025-01-07')
      await createGoal(page)

      const main = page.getByRole('main')
      await expect(main).toContainText(goalTitle)
      await expect(main).toContainText('Active')
      await expect(main).toContainText('January 1, 2025')
      await expect(main).toContainText('January 7, 2025')

      await createFirstGoalEntry(page)
      await createHourEntry(page, 200, '2025-01-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-06-01')
      await createNewGoalEntry(page)
      await createHourEntry(page, 200, '2025-12-01')

      await page.getByRole('tab', { name: 'Progress' }).click()

      const xAxisLabels = page.getByLabel('Progress').locator('g')

      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 2, 2025')
      await expect(xAxisLabels).toContainText('Jan 3, 2025')
      await expect(xAxisLabels).toContainText('Jan 4, 2025')
      await expect(xAxisLabels).toContainText('Jan 5, 2025')
      await expect(xAxisLabels).toContainText('Jan 6, 2025')
      await expect(xAxisLabels).toContainText('Jan 7, 2025')
    })
  })
})
