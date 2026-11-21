import { describe, expect, it, vi } from 'vitest'
import type { Database } from '~/types/api'
import type { BookDB } from '~/types/database'
import {
  SYNC_FILE_NAME,
  SyncFileError,
  syncFolder,
  type SyncDeps,
} from './folder-sync'

const FOLDER = '/Dropbox/BookLib'
const PATH = `${FOLDER}/${SYNC_FILE_NAME}`

const book = (id: string, title: string, day: number) =>
  ({
    id,
    title,
    created_at: '2026-11-01T00:00:00.000Z',
    updated_at: `2026-11-${String(day).padStart(2, '0')}T00:00:00.000Z`,
  }) as BookDB

const library = (books: BookDB[] = []): Database => ({
  authors: [],
  books,
  collections: [],
  'collection-book': [],
  goals: [],
})

/** A computer: its library, sharing one folder with the others */
function computer(folder: Map<string, string>, books: BookDB[]) {
  let data = library(books)
  const deps: SyncDeps = {
    files: {
      read: async (path) => folder.get(path) ?? null,
      write: async (path, text) => {
        folder.set(path, text)
      },
    },
    exportLibrary: async () => data,
    applySyncedLibrary: async (next) => {
      data = next
    },
    backUp: vi.fn(async () => {}),
  }
  return { deps, titles: () => data.books.map(({ title }) => title).sort() }
}

describe('syncFolder', () => {
  it('starts the folder file from the first computer', async () => {
    const folder = new Map<string, string>()
    const laptop = computer(folder, [book('b1', 'Piranesi', 2)])
    expect(await syncFolder(FOLDER, laptop.deps, { first: true })).toEqual({
      pulled: 0,
      pushed: true,
    })
    expect(JSON.parse(folder.get(PATH)!).books).toHaveLength(1)
    // Nothing to back up against yet
    expect(laptop.deps.backUp).not.toHaveBeenCalled()
  })

  it('brings two computers to the same library', async () => {
    const folder = new Map<string, string>()
    const laptop = computer(folder, [book('b1', 'Piranesi', 2)])
    const desktop = computer(folder, [book('b2', 'Kindred', 3)])

    await syncFolder(FOLDER, laptop.deps, { first: true })
    const result = await syncFolder(FOLDER, desktop.deps, { first: true })
    expect(result.pulled).toBe(1)
    expect(desktop.deps.backUp).toHaveBeenCalledWith('before-sync')
    await syncFolder(FOLDER, laptop.deps)

    expect(laptop.titles()).toEqual(['Kindred', 'Piranesi'])
    expect(desktop.titles()).toEqual(['Kindred', 'Piranesi'])
  })

  it('does not rewrite the folder file when nothing changed', async () => {
    const folder = new Map<string, string>()
    const laptop = computer(folder, [book('b1', 'Piranesi', 2)])
    await syncFolder(FOLDER, laptop.deps)
    expect(await syncFolder(FOLDER, laptop.deps)).toEqual({
      pulled: 0,
      pushed: false,
    })
  })

  it('leaves an unreadable folder file alone', async () => {
    const folder = new Map([[PATH, '{"half": "writ']])
    const laptop = computer(folder, [book('b1', 'Piranesi', 2)])
    await expect(syncFolder(FOLDER, laptop.deps)).rejects.toBeInstanceOf(
      SyncFileError,
    )
    expect(folder.get(PATH)).toBe('{"half": "writ')
  })
})
