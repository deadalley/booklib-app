import type { Page } from '@playwright/test'
import {
  expect,
  makeBook,
  makeDb,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'
import { makeEpub, makePdf } from './ebook-fixtures'

// Book ids must be uuids for the ebook store's checks on desktop
const BOOK_ID = '0b5c2f7e-1d1a-4c1e-9a43-6a2d7a0f1b23'
const book = makeBook('The Tidal House', { id: BOOK_ID, pages: 300 })

const stored = async (page: Page) =>
  (await readLibrary(page)).books.find(({ id }) => id === BOOK_ID)!

async function attach(page: Page, name: string, buffer: Buffer) {
  await seedLibrary(page, makeDb({ books: [book] }))
  await page.goto(`/library/books/${BOOK_ID}`)
  await page.getByTestId('ebook-file-input').setInputFiles({
    name,
    mimeType: name.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/epub+zip',
    buffer,
  })
  await expect(page.getByTestId('book-ebook')).toContainText(name)
}

test.describe('ebook reader', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
  })

  test('reads an EPUB, saving the place and a highlight', async ({ page }) => {
    await attach(page, 'tidal-house.epub', await makeEpub())
    await page.getByRole('link', { name: 'Read' }).click()
    await expect(page).toHaveURL(new RegExp(`/read/${BOOK_ID}`))

    const frame = page.frameLocator('[data-testid="epub-view"] iframe').first()
    await expect(frame.getByRole('heading', { name: 'Chapter 1' })).toBeVisible(
      {
        timeout: 15_000,
      },
    )

    // Jump to chapter 2 from the contents
    await page.getByRole('button', { name: 'Contents' }).click()
    await page.getByRole('button', { name: 'Chapter 2' }).click()
    await expect(
      frame.getByRole('heading', { name: 'Chapter 2' }),
    ).toBeVisible()

    // The place is saved, and the book counts as being read
    await expect
      .poll(async () => (await stored(page)).ebook?.location ?? '', {
        timeout: 10_000,
      })
      .toContain('/4/')
    expect((await stored(page)).progress_status).toBe('reading')

    // Select a sentence and highlight it
    await frame.getByText(/^Marker 2\./).evaluate((paragraph) => {
      const range = paragraph.ownerDocument.createRange()
      range.setStart(paragraph.firstChild!, 0)
      range.setEnd(paragraph.firstChild!, 'Marker 2.'.length)
      const selection = paragraph.ownerDocument.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)
      paragraph.ownerDocument.dispatchEvent(new Event('selectionchange'))
      paragraph.ownerDocument.dispatchEvent(new MouseEvent('mouseup'))
    })
    const bar = page.getByRole('dialog', { name: 'Selected text' })
    await expect(bar).toContainText('Marker 2.')
    await bar.getByRole('button', { name: 'Highlight' }).click()
    await expect(page.getByTestId('toast')).toContainText('Highlight saved')

    const notes = (await stored(page)).notes
    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({ content: 'Marker 2.' })
    expect(notes[0]!.highlight?.location).toMatch(/^epubcfi\(/)

    // The highlight is in the book's notes, and opens the reader there
    await page.goto(`/library/books/${BOOK_ID}`)
    await expect(page.locator('blockquote')).toHaveText('Marker 2.')
    await page.getByRole('link', { name: 'Show in book' }).click()
    await expect(page).toHaveURL(/\/read\/.*\?at=epubcfi/)
    await expect(
      page
        .frameLocator('[data-testid="epub-view"] iframe')
        .first()
        .getByText(/^Marker 2\./),
    ).toBeVisible({ timeout: 15_000 })
  })

  test('reads a PDF page by page', async ({ page }) => {
    await attach(page, 'tidal-house.pdf', makePdf(3))
    await page.getByRole('link', { name: 'Read' }).click()

    const position = page.getByTestId('reader-position')
    await expect(position).toHaveText('Page 1 of 3', { timeout: 15_000 })
    await expect(
      page.getByTestId('pdf-view').getByText('Page 1 of the tidal house'),
    ).toBeAttached()

    await page.keyboard.press('ArrowRight')
    await expect(position).toHaveText('Page 2 of 3')
    await page.getByRole('button', { name: 'Next page' }).click()
    await expect(position).toHaveText('Page 3 of 3')

    await expect
      .poll(async () => (await stored(page)).ebook?.location, {
        timeout: 10_000,
      })
      .toBe('page:3')
    const saved = await stored(page)
    expect(saved.ebook?.progress).toBe(1)
    expect(saved.current_page).toBe(3)

    // Reopening continues on the same page
    await page.goto(`/library/books/${BOOK_ID}`)
    await expect(page.getByTestId('book-ebook')).toContainText('100% read')
    await page.getByRole('link', { name: 'Continue reading' }).click()
    await expect(position).toHaveText('Page 3 of 3', { timeout: 15_000 })
  })

  test('refuses other files and removes the ebook', async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [book] }))
    await page.goto(`/library/books/${BOOK_ID}`)
    await page.getByTestId('ebook-file-input').setInputFiles({
      name: 'notes.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('hello'),
    })
    await expect(
      page.getByTestId('book-ebook').getByRole('alert'),
    ).toContainText('Only EPUB and PDF files')

    await page.getByTestId('ebook-file-input').setInputFiles({
      name: 'tidal-house.pdf',
      mimeType: 'application/pdf',
      buffer: makePdf(1),
    })
    await page.getByRole('button', { name: 'Remove the ebook file' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Remove' })
      .click()
    await expect(
      page.getByRole('button', { name: 'Add ebook file' }),
    ).toBeVisible()
    expect((await stored(page)).ebook).toBeNull()
  })
})
