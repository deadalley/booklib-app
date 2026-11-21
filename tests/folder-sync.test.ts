import type { Page } from '@playwright/test'
import { expect, makeBook, makeDb, test } from './fixtures'

/*
 * The desktop app, simulated: a stand-in for Electron's file API keeps
 * files in localStorage, so the library file, backups and the sync folder
 * all go through the same code as on a real computer.
 */

const DB_PATH = '/data/booklib-data.json'
const SYNC_PATH = '/Dropbox/BookLib/booklib-library.json'

const here = makeBook('Piranesi', { updated_at: '2026-11-01T00:00:00.000Z' })
const fromOtherComputer = makeBook('Kindred', {
  updated_at: '2026-11-02T00:00:00.000Z',
})

async function asDesktop(page: Page, files: Record<string, string>) {
  await page.addInitScript((seed) => {
    const KEY = 'test-desktop-files'
    if (!localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, JSON.stringify(seed))
    }
    const files: Record<string, string> = JSON.parse(localStorage.getItem(KEY)!)
    const save = () => localStorage.setItem(KEY, JSON.stringify(files))
    const noop = async () => null
    ;(window as unknown as { electronAPI: unknown }).electronAPI = {
      getDbPath: async () => '/data/booklib-data.json',
      fileExists: async (path: string) => path in files,
      readFile: async (path: string) => {
        if (!(path in files)) throw new Error(`ENOENT: ${path}`)
        return files[path]
      },
      writeFile: async (path: string, data: string) => {
        files[path] = data
        save()
      },
      ensureDir: noop,
      listDir: async (dir: string) =>
        Object.keys(files)
          .filter((path) => path.startsWith(`${dir}/`))
          .map((path) => path.slice(dir.length + 1)),
      deleteFile: async (path: string) => {
        Reflect.deleteProperty(files, path)
        save()
      },
      pickFolder: async () => '/Dropbox/BookLib',
      saveCover: noop,
      deleteCover: noop,
      renameCover: noop,
      downloadCover: noop,
    }
  }, files)
}

const readFile = (page: Page, path: string) =>
  page.evaluate(
    (p) => JSON.parse(localStorage.getItem('test-desktop-files')!)[p] ?? null,
    path,
  )

test('syncs the library through a folder', async ({ page }) => {
  await asDesktop(page, {
    [DB_PATH]: JSON.stringify(makeDb({ books: [here] })),
    // Another computer already syncs to this folder
    [SYNC_PATH]: JSON.stringify(makeDb({ books: [fromOtherComputer] })),
  })
  await page.goto('/data-management')
  const card = page.getByTestId('sync-card')
  await card.getByRole('button', { name: 'Choose a folder' }).click()

  await expect(card).toContainText('/Dropbox/BookLib')
  await expect(card.getByRole('status')).toContainText('Last synced today')

  // Both books, in this library and in the folder
  const titles = (json: string) =>
    JSON.parse(json)
      .books.map(({ title }: { title: string }) => title)
      .sort()
  expect(titles(await readFile(page, DB_PATH))).toEqual(['Kindred', 'Piranesi'])
  expect(titles(await readFile(page, SYNC_PATH))).toEqual([
    'Kindred',
    'Piranesi',
  ])

  // A backup came first, and the change can be shown
  await expect(
    page.getByTestId('backups-card').getByRole('list', { name: 'Backups' }),
  ).toContainText('Before the first sync · 1 book')
  await expect(page.getByTestId('toast')).toContainText(
    'Updated 1 item from your other computers',
  )
  await page
    .getByTestId('toast')
    .getByRole('button', { name: 'Refresh' })
    .click()

  await page.goto('/library/books')
  await expect(page.locator('.book-tile')).toHaveCount(2)
})

test('pushes a change made here to the folder', async ({ page }) => {
  await asDesktop(page, {
    [DB_PATH]: JSON.stringify(makeDb({ books: [here] })),
  })
  await page.goto('/data-management')
  await page
    .getByTestId('sync-card')
    .getByRole('button', { name: 'Choose a folder' })
    .click()
  await expect
    .poll(
      async () =>
        JSON.parse((await readFile(page, SYNC_PATH)) ?? '{}').books?.length,
    )
    .toBe(1)

  // Edit the book; the sync follows a few seconds later
  await page.goto(`/library/books/${here.id}`)
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click()
  await page.getByLabel('Title', { exact: true }).fill('Piranesi (signed)')
  await page.getByRole('button', { name: 'Save changes' }).first().click()

  await expect
    .poll(
      async () => JSON.parse(await readFile(page, SYNC_PATH)).books[0].title,
      { timeout: 15_000 },
    )
    .toBe('Piranesi (signed)')
  const synced = JSON.parse(await readFile(page, SYNC_PATH)).books[0]
  expect(synced.updated_at > here.updated_at!).toBe(true)
})
