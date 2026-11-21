import { describe, expect, it } from 'vitest'
import type { Database } from '~/types/api'
import {
  backupName,
  createBackup,
  isBackupDue,
  joinPath,
  listBackups,
  parentDir,
  parseBackupName,
  readBackup,
  type BackupStorage,
} from './backups'

function memoryStorage(capacity = Infinity) {
  const files = new Map<string, string>()
  const storage: BackupStorage = {
    list: async () => [...files.keys()],
    read: async (name) => files.get(name)!,
    write: async (name, text) => {
      if (files.size >= capacity) throw new Error('QuotaExceededError')
      files.set(name, text)
    },
    remove: async (name) => {
      files.delete(name)
    },
  }
  return { files, storage }
}

const library = (books = 2): Database => ({
  authors: [],
  books: Array.from({ length: books }, (_, i) => ({ id: `b${i}` })) as never,
  collections: [],
  'collection-book': [],
  goals: [],
})

const at = (iso: string) => new Date(iso)

describe('backup names', () => {
  it('round-trips the date, reason and book count', () => {
    const name = backupName(at('2026-11-21T10:15:00.553Z'), 'before-sync', 12)
    expect(name).toBe(
      'booklib-backup_2026-11-21T10-15-00-553Z_before-sync_12.json',
    )
    expect(parseBackupName(name)).toEqual({
      name,
      createdAt: '2026-11-21T10:15:00.553Z',
      reason: 'before-sync',
      books: 12,
    })
  })

  it('ignores other files', () => {
    expect(parseBackupName('notes.txt')).toBeNull()
    expect(
      parseBackupName('booklib-backup_2026-11-21T10-15-00-553Z_weird_1.json'),
    ).toBeNull()
  })
})

describe('createBackup', () => {
  it('keeps only the newest backups', async () => {
    const { storage } = memoryStorage()
    for (const day of ['01', '02', '03', '04']) {
      await createBackup(storage, library(), 'auto', {
        now: at(`2026-11-${day}T08:00:00.000Z`),
        max: 3,
      })
    }
    const names = (await listBackups(storage)).map(({ createdAt }) =>
      createdAt.slice(8, 10),
    )
    expect(names).toEqual(['04', '03', '02'])
  })

  it('drops the oldest when storage is full', async () => {
    const { storage, files } = memoryStorage(2)
    await createBackup(storage, library(), 'auto', {
      now: at('2026-11-01T08:00:00.000Z'),
    })
    await createBackup(storage, library(), 'auto', {
      now: at('2026-11-02T08:00:00.000Z'),
    })
    await createBackup(storage, library(5), 'manual', {
      now: at('2026-11-03T08:00:00.000Z'),
    })
    expect(files.size).toBe(2)
    const [newest] = await listBackups(storage)
    expect(newest).toMatchObject({ reason: 'manual', books: 5 })
  })

  it('reads a backup back, refusing anything else', async () => {
    const { storage, files } = memoryStorage()
    const info = await createBackup(storage, library(3), 'manual')
    expect((await readBackup(storage, info.name)).books).toHaveLength(3)
    files.set(info.name, '{"hello":1}')
    await expect(readBackup(storage, info.name)).rejects.toThrow()
  })
})

describe('isBackupDue', () => {
  const now = at('2026-11-21T12:00:00.000Z')
  it('is due without a recent automatic backup', () => {
    expect(isBackupDue([], now)).toBe(true)
    const recentManual = parseBackupName(
      backupName(at('2026-11-21T11:00:00.000Z'), 'manual', 1),
    )!
    expect(isBackupDue([recentManual], now)).toBe(true)
  })

  it('is not due within a day of the last one', () => {
    const recent = parseBackupName(
      backupName(at('2026-11-21T01:00:00.000Z'), 'auto', 1),
    )!
    expect(isBackupDue([recent], now)).toBe(false)
  })
})

describe('paths', () => {
  it('works with both separators', () => {
    expect(parentDir('/home/me/.config/booklib/booklib-data.json')).toBe(
      '/home/me/.config/booklib',
    )
    expect(parentDir('C:\\Users\\me\\booklib\\booklib-data.json')).toBe(
      'C:\\Users\\me\\booklib',
    )
    expect(joinPath('C:\\Users\\me', 'backups')).toBe('C:\\Users\\me\\backups')
    expect(joinPath('/home/me/', 'backups')).toBe('/home/me/backups')
  })
})
