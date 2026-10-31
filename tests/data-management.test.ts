import path from 'path'
import { readFileSync } from 'fs'
import {
  expect,
  makeAuthor,
  makeBook,
  makeDb,
  makeGoal,
  readLibrary,
  seedLibrary,
  test,
} from './fixtures'

const TEMPLATES = path.resolve(__dirname, '../public/templates')

test.describe('import', () => {
  test.beforeEach(async ({ page }) => {
    await seedLibrary(page, makeDb())
    await page.goto('/data-management')
    await expect(page.getByTestId('import-drop-zone')).toBeVisible()
  })

  test('imports every field from the CSV template', async ({ page }) => {
    await page
      .getByTestId('import-file-input')
      .setInputFiles(path.join(TEMPLATES, 'template.csv'))

    const preview = page.getByTestId('import-preview')
    await expect(preview.getByRole('heading', { level: 4 })).toContainText(
      '3 of 3 books selected',
    )
    await expect(page.getByTestId('import-issues')).toHaveCount(0)

    await page.getByTestId('import-submit').click()
    await expect(page).toHaveURL(/\/library\/books$/)

    const db = await readLibrary(page)
    expect(db.books).toHaveLength(3)
    expect(db.authors.map((a) => a.name).sort()).toEqual([
      'Gabriel García Márquez',
      'Susanna Clarke',
      'Ursula K. Le Guin',
    ])

    const leGuin = db.books.find(
      (b) => b.title === 'The Left Hand of Darkness',
    )!
    expect(leGuin).toMatchObject({
      publisher: 'Ace Books',
      language: 'en',
      year: 1969,
      pages: 304,
      isbn: '9780441478125',
      rating: 5,
      genres: ['Science Fiction', 'Classics'],
      format: 'paperback',
      property_status: 'owned',
      progress_status: 'read',
      started_at: '2024-02-01T00:00:00.000Z',
      finished_at: '2024-02-20T00:00:00.000Z',
      current_page: 304,
      notes: [expect.objectContaining({ page: 150 })],
    })
  })

  test('imports the JSON template', async ({ page }) => {
    await page
      .getByTestId('import-file-input')
      .setInputFiles(path.join(TEMPLATES, 'template.json'))
    await page.getByTestId('import-submit').click()
    await expect(page).toHaveURL(/\/library\/books$/)
    expect((await readLibrary(page)).books).toHaveLength(3)
  })

  test('reports invalid rows instead of failing', async ({ page }) => {
    await page.getByTestId('import-file-input').setInputFiles({
      name: 'broken.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('TITLE,YEAR,RATING\n,1999,\nGood book,soon,9\n'),
    })

    const issues = page.getByTestId('import-issues')
    await expect(issues).toContainText('1 row skipped')
    await expect(issues).toContainText('Missing title')
    await expect(
      page.getByTestId('import-preview').getByRole('heading', { level: 4 }),
    ).toContainText('1 of 1 books selected')
  })

  test('rejects unsupported files', async ({ page }) => {
    await page.getByTestId('import-file-input').setInputFiles({
      name: 'books.xlsx',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('nope'),
    })
    await expect(page.getByTestId('import-error')).toContainText(
      'Unsupported file type',
    )
  })
})

test('flags books that are already in the library as duplicates', async ({
  page,
}) => {
  const author = makeAuthor('Susanna Clarke')
  await seedLibrary(
    page,
    makeDb({
      authors: [author],
      books: [
        makeBook('Piranesi', { author_id: author.id, isbn: '9781635575637' }),
      ],
    }),
  )
  await page.goto('/data-management')
  await page
    .getByTestId('import-file-input')
    .setInputFiles(path.join(TEMPLATES, 'template.csv'))

  const preview = page.getByTestId('import-preview')
  await expect(preview).toContainText('1 possible duplicate')
  await expect(preview).toContainText('2 new authors')
  await expect(preview.getByRole('heading', { level: 4 })).toContainText(
    '2 of 3 books selected',
  )

  await page.getByTestId('import-submit').click()
  await expect(page).toHaveURL(/\/library\/books$/)
  const db = await readLibrary(page)
  expect(db.books.filter((b) => b.title === 'Piranesi')).toHaveLength(1)
  // The existing author was reused, not duplicated
  expect(db.authors.filter((a) => a.name === 'Susanna Clarke')).toHaveLength(1)
})

test.describe('export', () => {
  const author = makeAuthor('Ted Chiang')
  const collection = {
    id: 'shelf',
    name: 'Short fiction',
    created_at: '2024-01-01T00:00:00.000Z',
  }
  const story = makeBook('Stories of Your Life', {
    author_id: author.id,
    year: 2002,
    genres: ['Science Fiction', 'Short stories'],
    notes: [
      { createdAt: '2024-03-01T00:00:00.000Z', content: 'Tower of Babylon' },
    ],
    progress_status: 'reading',
    current_page: 80,
    collections: [collection.id],
  })
  const library = makeDb({
    authors: [author],
    books: [story],
    collections: [collection],
    'collection-book': [
      { book_id: story.id, collection_id: collection.id, order: 0 },
    ],
    goals: [
      makeGoal('Read 10 books', {
        entries: [
          {
            id: 'e1',
            book_id: story.id,
            created_at: '2024-03-05T00:00:00.000Z',
          },
        ],
      }),
    ],
  })

  async function download(
    page: import('@playwright/test').Page,
    format: RegExp,
  ) {
    await page.goto('/data-management')
    await page.getByRole('radio', { name: format }).click()
    const [file] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('export-submit').click(),
    ])
    const filePath = await file.path()
    return {
      name: file.suggestedFilename(),
      contents: readFileSync(filePath, 'utf8'),
    }
  }

  test('books exported as CSV re-import with every field', async ({
    page,
    browser,
  }) => {
    await seedLibrary(page, library)
    const { name, contents } = await download(page, /Books \(CSV\)/)
    expect(name).toMatch(/_booklib_books\.csv$/)
    expect(contents.split('\n')[0]).toContain('TITLE,AUTHOR')

    const fresh = await browser.newPage()
    await seedLibrary(fresh, makeDb())
    await fresh.goto('/data-management')
    await fresh.getByTestId('import-file-input').setInputFiles({
      name,
      mimeType: 'text/csv',
      buffer: Buffer.from(contents),
    })
    await fresh.getByTestId('import-submit').click()
    await expect(fresh).toHaveURL(/\/library\/books$/)

    const db = await readLibrary(fresh)
    expect(db.authors.map((a) => a.name)).toEqual(['Ted Chiang'])
    expect(db.books[0]).toMatchObject({
      title: story.title,
      year: 2002,
      genres: story.genres,
      notes: story.notes,
      progress_status: 'reading',
      current_page: 80,
      // collections are intentionally not part of book exports
      collections: [],
    })
    await fresh.close()
  })

  test('a full backup restores collections and goals', async ({
    page,
    browser,
  }) => {
    await seedLibrary(page, library)
    const { name, contents } = await download(page, /Full backup/)
    expect(name).toMatch(/_booklib_backup\.json$/)

    const fresh = await browser.newPage()
    await seedLibrary(fresh, makeDb())
    await fresh.goto('/data-management')
    await fresh.getByTestId('import-file-input').setInputFiles({
      name,
      mimeType: 'application/json',
      buffer: Buffer.from(contents),
    })
    await fresh.getByRole('button', { name: 'Restore full backup' }).click()
    await expect(fresh).toHaveURL(/\/library\/books$/)

    const db = await readLibrary(fresh)
    const restored = db.books.find((b) => b.title === story.title)!
    const shelf = db.collections.find((c) => c.name === 'Short fiction')!
    expect(db['collection-book']).toContainEqual(
      expect.objectContaining({
        book_id: restored.id,
        collection_id: shelf.id,
      }),
    )
    expect(db.goals[0]?.entries.map((e) => e.book_id)).toEqual([restored.id])
    await fresh.close()
  })
})
