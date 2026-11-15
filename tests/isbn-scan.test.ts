import {
  expect,
  makeBook,
  makeDb,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'
import {
  ISBN,
  leGuin,
  mockLookups,
  openNewBook,
  typeIsbn,
} from './isbn-helpers'

// The books page needs a book, or it sends an empty library home
const other = makeBook('Kindred')

test.describe('ISBN lookup', () => {
  test('fills a new book from a typed ISBN', async ({ page }) => {
    await mockLookups(page)
    await openNewBook(page)
    await page.getByRole('button', { name: 'Scan ISBN' }).click()

    await typeIsbn(page, '12345')
    await expect(
      page.getByTestId('isbn-scanner').getByRole('alert'),
    ).toContainText('isn’t a valid ISBN')

    await typeIsbn(page, '978-0-06-051275-0')
    const scanner = page.getByTestId('isbn-scanner')
    await expect(scanner).toContainText('The Dispossessed')
    await expect(scanner).toContainText('2003 · 387 pages · Harper Perennial')
    await page.getByRole('button', { name: 'Use these details' }).click()

    await expect(
      page.getByRole('heading', { name: 'The Dispossessed' }),
    ).toBeVisible()
    await page.getByRole('button', { name: 'Create book' }).first().click()
    await expect(page).toHaveURL(/\/library\/books$/)

    const db = await readLibrary(page)
    expect(db.books).toHaveLength(1)
    expect(db.books[0]).toMatchObject({
      title: 'The Dispossessed',
      isbn: ISBN,
      // The existing author, matched by name
      author_id: leGuin.id,
      publisher: 'Harper Perennial',
      year: 2003,
      pages: 387,
      language: 'en',
      genres: ['Science Fiction'],
    })
  })

  test('says when an ISBN is unknown and can keep it', async ({ page }) => {
    await page.route('https://openlibrary.org/**', (route) =>
      route.fulfill({ json: {} }),
    )
    await page.route('https://www.googleapis.com/books/**', (route) =>
      route.fulfill({ json: { totalItems: 0 } }),
    )
    await openNewBook(page)
    await page.getByRole('button', { name: 'Scan ISBN' }).click()
    await typeIsbn(page, ISBN)
    await expect(page.getByTestId('isbn-scanner')).toContainText(
      'No details found',
    )
    await page.getByRole('button', { name: 'Keep the ISBN' }).click()
    await expect(page.getByLabel('ISBN', { exact: true })).toHaveValue(ISBN)
  })

  test('saves an offline scan and fills it in once back online', async ({
    page,
    context,
  }) => {
    // Load the books page first: the dev server can't serve its code offline
    await seedLibrary(page, makeDb({ authors: [leGuin], books: [other] }))
    await page.goto('/library/books')
    await page.getByRole('link', { name: 'Add book' }).click()
    await expect(
      page.getByRole('heading', { name: 'Untitled book' }),
    ).toBeVisible()
    await context.setOffline(true)
    await page.getByRole('button', { name: 'Scan ISBN' }).click()
    await typeIsbn(page, ISBN)
    await expect(page.getByTestId('isbn-scanner')).toContainText(
      'You’re offline',
    )
    await page.getByRole('button', { name: 'Keep the ISBN' }).click()
    await expect(page.getByTestId('pending-lookup')).toBeVisible()
    await page.getByRole('button', { name: 'Create book' }).first().click()

    await expect(page.getByTestId('lookup-notice')).toContainText(
      '1 scanned book is waiting for its details',
    )
    const scanned = async () =>
      (await readLibrary(page)).books.find((book) => book.isbn === ISBN)
    expect(await scanned()).toMatchObject({
      title: `ISBN ${ISBN}`,
      isbn: ISBN,
    })

    await mockLookups(page)
    await context.setOffline(false)
    await expect(page.getByTestId('toast')).toContainText(
      'Filled in the details for The Dispossessed',
    )
    await expect(page.getByTestId('lookup-notice')).toBeHidden()
    expect(await scanned()).toMatchObject({
      title: 'The Dispossessed',
      pages: 387,
      author_id: leGuin.id,
    })
  })

  test('opens the scanner from the books page', async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [other] }))
    await page.goto('/library/books')
    await page.getByRole('link', { name: 'Scan ISBN' }).click()
    await expect(page.getByTestId('isbn-scanner')).toBeVisible()
  })
})
