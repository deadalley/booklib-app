import { expect, test } from './fixtures'
import { ISBN, mockLookups, startScan, writeBarcodeVideo } from './isbn-helpers'

// Chromium plays a video of an ISBN barcode as its fake camera
test.use({
  permissions: ['camera'],
  launchOptions: {
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${writeBarcodeVideo(ISBN)}`,
    ],
  },
})

test.describe('ISBN camera scan', () => {
  test('reads the barcode and looks the book up', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'Fake camera is Chromium only')
    await mockLookups(page)
    await startScan(page)

    await expect(page.getByTestId('isbn-scanner')).toContainText(
      'The Dispossessed',
      { timeout: 20_000 },
    )
    // Still on the books page until a choice is made
    await expect(page).toHaveURL(/\/library\/books$/)
    await page.getByRole('button', { name: 'Use these details' }).click()
    await expect(page).toHaveURL(/\/library\/books\/new$/)
    await expect(page.getByLabel('ISBN', { exact: true })).toHaveValue(ISBN)
  })
})
