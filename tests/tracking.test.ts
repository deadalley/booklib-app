import { test, expect } from '@playwright/test'

test('create goal', async ({ page }) => {
  await page.goto('/#/tracking')

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
})
