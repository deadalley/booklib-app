import { expect, makeBook, makeDb, seedLibrary, test } from './fixtures'

const html = (page: import('@playwright/test').Page) => page.locator('html')

test.describe('theme', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [makeBook('Book 1')] }))
  })

  test('uses the light theme by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/settings')
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
    await expect(
      page.getByTestId('settings-theme').getByRole('radio', { name: 'Light' }),
    ).toBeChecked()
  })

  test('follows the system theme when chosen', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/settings')
    await page
      .getByTestId('settings-theme')
      .getByRole('radio', { name: 'System' })
      .click()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await page.emulateMedia({ colorScheme: 'light' })
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('switches and remembers the theme from settings', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/settings')
    const section = page.getByTestId('settings-theme')
    await section.getByRole('radio', { name: 'Dark' }).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    // Dark tokens apply to the page background
    await expect(page.locator('body')).toHaveCSS(
      'background-color',
      'rgb(21, 19, 19)',
    )

    await page.reload()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')

    await section.getByRole('radio', { name: 'Light' }).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })

  test('toggles from the header', async ({ page }) => {
    await page.goto('/home')
    await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'dark')
    await page.getByRole('button', { name: 'Switch to light theme' }).click()
    await expect(html(page)).toHaveAttribute('data-theme', 'light')
  })
})
