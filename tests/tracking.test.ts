import { test, expect } from '@playwright/test'

test.describe('create goal', async () => {
  test.beforeEach(async ({ page }) => {
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

      await page.getByRole('combobox').filter({ hasText: 'Type' }).click()
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
      await expect(chart).toContainText('10')
    })

    test('by year', async ({ page }) => {
      await page.getByText('Goal', { exact: true }).click()

      await page.getByRole('textbox', { name: 'Goal title' }).click()
      await page
        .getByRole('textbox', { name: 'Goal title' })
        .fill('10 books per year in a year')

      await page.getByText('Create goal as active').click()

      await page.getByPlaceholder('Amount').click()
      await page.getByPlaceholder('Amount').fill('10')

      await page.getByRole('combobox').filter({ hasText: 'Type' }).click()
      await page.getByLabel('Books').getByText('Books').click()

      await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
      await page.getByLabel('per year').getByText('per year').click()

      await page
        .getByRole('combobox')
        .filter({ hasText: 'Select date range' })
        .click()
      await page.getByLabel('This year').getByText('This year').click()

      await page.getByRole('button', { name: 'Create goal' }).click()

      await expect(page.getByRole('main')).toContainText(
        '10 books per year in a year',
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
      await expect(page.locator('canvas')).toBeVisible()
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

      await page.getByRole('combobox').filter({ hasText: 'Type' }).click()
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
      await page.locator('a').filter({ hasText: 'Book 1' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page.locator('a').filter({ hasText: 'Book 2' }).first().click()
      await page.getByRole('button', { name: 'Add new entry' }).click()
      await page.locator('a').filter({ hasText: 'Book 3' }).first().click()

      await page.getByRole('tab', { name: 'Progress' }).click()
      await expect(page.locator('canvas')).toBeVisible()
    })
  })
})
