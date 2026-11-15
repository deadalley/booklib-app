import { expect, test } from './fixtures'
import { startScan, writeBarcodeVideo } from './isbn-helpers'

// A UPC price code, as on the back of many US mass-market paperbacks
// (read as an EAN-13 with a leading 0)
test.use({
  permissions: ['camera'],
  launchOptions: {
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-video-capture=${writeBarcodeVideo('0036000291452')}`,
    ],
  },
})

test('explains a barcode that is not an ISBN', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Fake camera is Chromium only')
  await startScan(page)
  await expect(page.getByTestId('scanner-status')).toContainText(
    'that’s a price code (UPC), not the ISBN',
    { timeout: 20_000 },
  )
})
