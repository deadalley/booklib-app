import type { Page } from '@playwright/test'

export async function setTitle(page: Page, name: string): Promise<void> {
  await page.getByRole('textbox', { name: 'Goal title' }).click()
  await page.getByRole('textbox', { name: 'Goal title' }).fill(name)
}

export async function setAsActive(page: Page): Promise<void> {
  await page.getByText('Create goal as active').click()
}

export async function setAmount(page: Page, amount: number): Promise<void> {
  await page.getByPlaceholder('Amount').click()
  await page.getByPlaceholder('Amount').fill(amount.toString())
}

export async function setType(page: Page, type: string): Promise<void> {
  await page
    .locator('div')
    .filter({ hasText: /^TypeBooksPagesHours$/ })
    .nth(2)
    .click()
  await page.getByLabel(type).getByText(type).click()
}

export async function setInterval(page: Page, interval: string): Promise<void> {
  await page.getByRole('combobox').filter({ hasText: 'Interval' }).click()
  await page.getByLabel(interval).getByText(interval).click()
}

export async function setDateRange(
  page: Page,
  dateRange: string,
): Promise<void> {
  await page
    .getByRole('combobox')
    .filter({ hasText: 'Select date range' })
    .click()
  await page.getByLabel(dateRange).getByText(dateRange).click()
}

export async function setDateRangeDates(
  page: Page,
  startDate: string,
  endDate: string,
): Promise<void> {
  await page.getByRole('textbox', { name: 'Start on' }).fill(startDate)
  await page.getByRole('textbox', { name: 'Finish on' }).fill(endDate)
}

export async function createGoal(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Create goal' }).click()
}

export async function createFirstGoalEntry(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Create first entry' }).click()
}

export async function createNewGoalEntry(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add new entry' }).click()
}

export async function createBookEntry(
  page: Page,
  book: string,
  date?: string,
): Promise<void> {
  if (date) {
    await page.getByRole('textbox', { name: 'Finished on' }).fill(date)
  }
  await page.locator('a').filter({ hasText: book }).first().click()
}

export async function deleteGoal(page: Page): Promise<void> {
  await page
    .locator('[id="__nuxt"]')
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(1)
    .click()
  await page.getByText('Delete', { exact: true }).click()
}
