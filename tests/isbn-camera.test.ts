import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { expect, test } from './fixtures'
import { ISBN, mockLookups, startScan } from './isbn-helpers'

// Chromium plays a video of an ISBN barcode as its fake camera
/** The bars of an EAN-13 code, as 95 modules (true = black) */
function ean13Modules(code: string): boolean[] {
  const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'] // prettier-ignore
  const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'] // prettier-ignore
  const R = L.map((bits) => [...bits].map((b) => (b === '0' ? '1' : '0')).join('')) // prettier-ignore
  const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'] // prettier-ignore
  const digits = [...code].map(Number)
  const parity = PARITY[digits[0]!]!
  let bits = '101'
  digits.slice(1, 7).forEach((d, i) => {
    bits += (parity[i] === 'L' ? L : G)[d]
  })
  bits += '01010'
  digits.slice(7).forEach((d) => (bits += R[d]))
  bits += '101'
  return [...bits].map((b) => b === '1')
}

/** A short Y4M video of the barcode, black on white */
function writeBarcodeVideo(code: string): string {
  const width = 640
  const height = 480
  const module = 4
  const modules = ean13Modules(code)
  const left = Math.floor((width - modules.length * module) / 2)
  const luma = Buffer.alloc(width * height, 235)
  for (let y = 120; y < 360; y++) {
    modules.forEach((black, i) => {
      if (!black) return
      for (let x = 0; x < module; x++) {
        luma[y * width + left + i * module + x] = 16
      }
    })
  }
  const chroma = Buffer.alloc((width / 2) * (height / 2), 128)
  const frame = Buffer.concat([Buffer.from('FRAME\n'), luma, chroma, chroma])
  const file = path.join(os.tmpdir(), `booklib-isbn-${code}.y4m`)
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from(`YUV4MPEG2 W${width} H${height} F10:1 Ip A1:1 C420jpeg\n`),
      ...Array(10).fill(frame),
    ]),
  )
  return file
}

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
    await page.getByRole('button', { name: 'Use these details' }).click()
    await expect(page.getByLabel('ISBN', { exact: true })).toHaveValue(ISBN)
  })
})
