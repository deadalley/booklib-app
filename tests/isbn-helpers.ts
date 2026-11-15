import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { Page } from '@playwright/test'
import { expect, makeAuthor, makeBook, makeDb, seedLibrary } from './fixtures'

/* Shared by the ISBN lookup and camera scan tests */

export const ISBN = '9780060512750'
export const leGuin = makeAuthor('Ursula K. Le Guin')

const OPEN_LIBRARY = {
  [`ISBN:${ISBN}`]: {
    title: 'The Dispossessed',
    authors: [{ name: 'Ursula K. Le Guin' }],
    publishers: [{ name: 'Harper Perennial' }],
    publish_date: 'October 2003',
    number_of_pages: 387,
  },
}
const GOOGLE_BOOKS = {
  items: [
    {
      volumeInfo: {
        title: 'The Dispossessed',
        description: 'Shevek, a brilliant physicist, decides to act.',
        language: 'en',
        categories: ['Fiction / Science Fiction / General'],
      },
    },
  ],
}

/** Answers lookups like Open Library and Google Books would */
export async function mockLookups(page: Page) {
  await page.route('https://openlibrary.org/**', (route) =>
    route.fulfill({ json: OPEN_LIBRARY }),
  )
  await page.route('https://www.googleapis.com/books/**', (route) =>
    route.fulfill({ json: GOOGLE_BOOKS }),
  )
}

// The books page needs a book, or it sends an empty library home
export const otherBook = makeBook('Kindred')

/** Add book → Scan ISBN, from the books page */
export async function startScan(page: Page, { seed = true } = {}) {
  if (seed) {
    await seedLibrary(page, makeDb({ authors: [leGuin], books: [otherBook] }))
    await page.goto('/library/books')
  }
  await page.getByRole('button', { name: 'Add book' }).click()
  await page
    .getByTestId('add-book-options')
    .getByRole('button', { name: 'Scan ISBN' })
    .click()
  await expect(page.getByTestId('isbn-scanner')).toBeVisible()
}

export async function typeIsbn(page: Page, isbn: string) {
  const scanner = page.getByTestId('isbn-scanner')
  await scanner.getByLabel('Or type the ISBN').fill(isbn)
  await scanner.getByRole('button', { name: 'Look up' }).click()
}

// Fake cameras: Chromium plays a video file as the camera

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
export function writeBarcodeVideo(code: string): string {
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
