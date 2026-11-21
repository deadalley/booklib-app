import {
  expect,
  makeBook,
  makeDb,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const piranesi = makeBook('Piranesi')
const kindred = makeBook('Kindred')

test.describe('backups', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb({ books: [piranesi, kindred] }))
    await page.goto('/data-management')
    await expect(page.getByTestId('backups-card')).toBeVisible()
  })

  test('makes the daily backup when the app opens', async ({ page }) => {
    const card = page.getByTestId('backups-card')
    await expect(card.getByRole('list', { name: 'Backups' })).toContainText(
      'Daily backup · 2 books',
    )
  })

  test('restores a backup, keeping a copy of the library first', async ({
    page,
  }) => {
    const card = page.getByTestId('backups-card')
    await card.getByRole('button', { name: 'Back up now' }).click()
    await expect(card.getByRole('status')).toContainText('Backed up 2 books.')

    // Delete a book, then go back to the backup
    await page.evaluate(
      ({ id }) => {
        const key = 'booklib-data'
        const db = JSON.parse(localStorage.getItem(key)!)
        db.books = db.books.filter((book: { id: string }) => book.id !== id)
        localStorage.setItem(key, JSON.stringify(db))
      },
      { id: kindred.id },
    )
    expect((await readLibrary(page)).books).toHaveLength(1)

    await card
      .getByRole('listitem')
      .filter({ hasText: 'Made by you' })
      .getByRole('button', { name: 'Restore' })
      .click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Restore' })
      .click()
    await expect(card.getByRole('status')).toContainText('Restored the backup')

    expect(
      (await readLibrary(page)).books.map(({ title }) => title).sort(),
    ).toEqual(['Kindred', 'Piranesi'])
    await expect(card.getByRole('list', { name: 'Backups' })).toContainText(
      'Before a restore · 1 book',
    )
  })

  test('folder sync points to the desktop app on the web', async ({ page }) => {
    await expect(page.getByTestId('sync-card')).toContainText(
      'Folder sync is available in the desktop app.',
    )
  })
})

const GOODREADS = `Book Id,Title,Author,ISBN,ISBN13,My Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Exclusive Shelf,Owned Copies
1,The Dispossessed,Ursula K. Le Guin,"=""0060512750""","=""9780060512750""",5,Harper,Paperback,387,2003,1974,2024/03/01,2023/12/01,favorites,read,1
2,Kindred,Octavia E. Butler,"=""""","=""""",0,Beacon,Kindle Edition,264,2003,1979,,2024/01/10,to-read,to-read,0
`

test('imports a Goodreads export, shelves included', async ({ page }) => {
  await seedLibrary(page, makeDb())
  await page.goto('/data-management')
  await page.getByTestId('import-file-input').setInputFiles({
    name: 'goodreads_library_export.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(GOODREADS),
  })
  const preview = page.getByTestId('import-preview')
  await expect(preview).toContainText('Goodreads export')
  await page.getByTestId('import-submit').click()
  await expect(page).toHaveURL(/\/library\/books$/)

  const db = await readLibrary(page)
  const byTitle = (title: string) => db.books.find((b) => b.title === title)!
  expect(byTitle('The Dispossessed')).toMatchObject({
    progress_status: 'read',
    rating: 5,
    format: 'paperback',
  })
  const memberships = (bookTitle: string) =>
    db['collection-book']
      .filter(({ book_id }) => book_id === byTitle(bookTitle).id)
      .map(({ collection_id }) => collection_id)
  expect(memberships('The Dispossessed')).toEqual(['favorite'])
  expect(memberships('Kindred')).toEqual(['tbr'])
  // A backup was made before importing
  const backups = await page.evaluate(() =>
    Object.keys(localStorage).filter((key) => key.includes('before-import')),
  )
  expect(backups).toHaveLength(1)
})
