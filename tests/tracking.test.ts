import { test, expect } from '@playwright/test'

test.describe('create goal', async () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2025-07-01T00:00:00Z'))
    await page.goto('/#/tracking')
  })

  test.describe('books', async () => {
    test('total', async ({ page }) => {
      await page.getByText('Goal', { exact: true }).click()

      await page.getByRole('textbox', { name: 'Goal title' }).click()
      await page
        .getByRole('textbox', { name: 'Goal title' })
        .fill('10 books in total in a year')

      await page.getByText('Create goal as active').click()

      await page.getByPlaceholder('Amount').click()
      await page.getByPlaceholder('Amount').fill('10')

      await page
        .locator('div')
        .filter({ hasText: /^TypeBooksPagesHours$/ })
        .nth(2)
        .click()
      await page.getByLabel('Books').getByText('Books').click()

      await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
      await page.getByLabel('in total').getByText('in total').click()

      await page
        .getByRole('combobox')
        .filter({ hasText: 'Select date range' })
        .click()
      await page.getByLabel('This year').getByText('This year').click()

      await page.getByRole('button', { name: 'Create goal' }).click()

      await expect(page.getByRole('main')).toContainText(
        '10 books in total in a year',
      )
      await expect(page.getByRole('main')).toContainText('Active')
      await expect(page.getByRole('main')).toContainText('January 1, 2025')
      await expect(page.getByRole('main')).toContainText('December 31, 2025')

      await page.getByRole('button', { name: 'Create first entry' }).click()
      await page.locator('a').filter({ hasText: 'Book 1' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page.locator('a').filter({ hasText: 'Book 2' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page.locator('a').filter({ hasText: 'Book 3' }).first().click()

      await page.getByRole('tab', { name: 'Progress' }).click()

      const chart = await page.getByLabel('Progress').getByRole('img')

      await expect(chart).toContainText('Jan 2025')
      await expect(chart).toContainText('Jul 2025')
      await expect(chart).toContainText('3')
      await expect(chart).toContainText('Dec 2025')
      await expect(chart).toContainText('10')
    })

    test('by year', async ({ page }) => {
      await page.getByText('Goal', { exact: true }).click()

      await page.getByRole('textbox', { name: 'Goal title' }).click()
      await page
        .getByRole('textbox', { name: 'Goal title' })
        .fill('10 books per year in two years')

      await page.getByText('Create goal as active').click()

      await page.getByPlaceholder('Amount').click()
      await page.getByPlaceholder('Amount').fill('10')

      await page
        .locator('div')
        .filter({ hasText: /^TypeBooksPagesHours$/ })
        .nth(2)
        .click()
      await page.getByLabel('Books').getByText('Books').click()

      await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
      await page.getByLabel('per year').getByText('per year').click()

      await page.getByRole('textbox', { name: 'Start on' }).fill('2025-01-01')
      await page.getByRole('textbox', { name: 'Finish on' }).fill('2026-12-31')

      await page.getByRole('button', { name: 'Create goal' }).click()

      await expect(page.getByRole('main')).toContainText(
        '10 books per year in two years',
      )
      await expect(page.getByRole('main')).toContainText('Active')
      await expect(page.getByRole('main')).toContainText('January 1, 2025')
      await expect(page.getByRole('main')).toContainText('December 31, 2026')

      await page.getByRole('button', { name: 'Create first entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-02-01')
      await page.locator('a').filter({ hasText: 'Book 1' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2026-02-01')
      await page.locator('a').filter({ hasText: 'Book 2' }).first().click()

      await page.getByRole('tab', { name: 'Progress' }).click()
      const xAxisLabels = page.getByLabel('Progress').locator('g')
      await expect(xAxisLabels).toContainText('Jan 1, 2025')
      await expect(xAxisLabels).toContainText('Jan 1, 2026')
    })

    test('by month', async ({ page }) => {
      await page.getByText('Goal', { exact: true }).click()

      await page.getByRole('textbox', { name: 'Goal title' }).click()
      await page
        .getByRole('textbox', { name: 'Goal title' })
        .fill('10 books per month in a year')

      await page.getByText('Create goal as active').click()

      await page.getByPlaceholder('Amount').click()
      await page.getByPlaceholder('Amount').fill('10')

      await page
        .locator('div')
        .filter({ hasText: /^TypeBooksPagesHours$/ })
        .nth(2)
        .click()
      await page.getByLabel('Books').getByText('Books').click()

      await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
      await page.getByLabel('per month').getByText('per month').click()

      await page
        .getByRole('combobox')
        .filter({ hasText: 'Select date range' })
        .click()
      await page.getByLabel('This year').getByText('This year').click()

      await page.getByRole('button', { name: 'Create goal' }).click()

      await expect(page.getByRole('main')).toContainText(
        '10 books per month in a year',
      )
      await expect(page.getByRole('main')).toContainText('Active')
      await expect(page.getByRole('main')).toContainText('January 1, 2025')
      await expect(page.getByRole('main')).toContainText('December 31, 2025')

      await page.getByRole('button', { name: 'Create first entry' }).click()

      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-01-01')
      await page.locator('a').filter({ hasText: 'Book 1' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-06-01')
      await page.locator('a').filter({ hasText: 'Book 2' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-12-01')
      await page.locator('a').filter({ hasText: 'Book 3' }).first().click()

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
      await page.getByText('Goal', { exact: true }).click()

      await page.getByRole('textbox', { name: 'Goal title' }).click()
      await page
        .getByRole('textbox', { name: 'Goal title' })
        .fill('10 books per week in a month')

      await page.getByText('Create goal as active').click()

      await page.getByPlaceholder('Amount').click()
      await page.getByPlaceholder('Amount').fill('10')

      await page
        .locator('div')
        .filter({ hasText: /^TypeBooksPagesHours$/ })
        .nth(2)
        .click()
      await page.getByLabel('Books').getByText('Books').click()

      await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
      await page.getByLabel('per week').getByText('per week').click()

      await page
        .getByRole('combobox')
        .filter({ hasText: 'Select date range' })
        .click()
      await page.getByLabel('This month').getByText('This month').click()

      await page.getByRole('button', { name: 'Create goal' }).click()

      await expect(page.getByRole('main')).toContainText(
        '10 books per week in a month',
      )
      await expect(page.getByRole('main')).toContainText('Active')
      await expect(page.getByRole('main')).toContainText('July 1, 2025')
      await expect(page.getByRole('main')).toContainText('July 7, 2025')

      await page.getByRole('button', { name: 'Create first entry' }).click()

      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-01-01')
      await page.locator('a').filter({ hasText: 'Book 1' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-06-01')
      await page.locator('a').filter({ hasText: 'Book 2' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page
        .getByRole('textbox', { name: 'Finished on' })
        .fill('2025-12-01')
      await page.locator('a').filter({ hasText: 'Book 3' }).first().click()

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
  })
})
