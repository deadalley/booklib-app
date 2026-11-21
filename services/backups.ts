import type { Database } from '~/types/api'
import { getAppPlatform } from '~/utils/platform'
import { isLibraryData } from './data-management'

/*
 * Local backups: full copies of the library, made automatically once a day
 * and before anything that replaces or merges data (restoring a backup,
 * importing a library, the first sync). They stay on this device; the
 * newest ones are kept.
 */

export type BackupReason =
  | 'auto'
  | 'manual'
  | 'before-restore'
  | 'before-import'
  | 'before-sync'

export type BackupInfo = {
  name: string
  createdAt: string
  reason: BackupReason
  books: number
}

export const BACKUP_REASONS: Record<BackupReason, string> = {
  auto: 'Daily backup',
  manual: 'Made by you',
  'before-restore': 'Before a restore',
  'before-import': 'Before an import',
  'before-sync': 'Before the first sync',
}

// One automatic backup a day
export const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000

/** How many backups this device keeps (browser storage is small) */
export function maxBackups(platform = getAppPlatform()) {
  return platform === 'web' ? 5 : 30
}

const PREFIX = 'booklib-backup'

/** `booklib-backup_2026-11-21T10-15-00-553Z_auto_123.json` */
export function backupName(date: Date, reason: BackupReason, books: number) {
  const stamp = date.toISOString().replace(/[:.]/g, '-')
  return `${PREFIX}_${stamp}_${reason}_${books}.json`
}

/** A backup's details from its file name, or null for other files */
export function parseBackupName(name: string): BackupInfo | null {
  const match = name.match(
    /^booklib-backup_(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z_([a-z-]+)_(\d+)\.json$/,
  )
  if (!match) return null
  const [, day, hours, minutes, seconds, ms, reason, books] = match
  if (!(reason! in BACKUP_REASONS)) return null
  return {
    name,
    createdAt: `${day}T${hours}:${minutes}:${seconds}.${ms}Z`,
    reason: reason as BackupReason,
    books: Number(books),
  }
}

/** Where backups are kept */
export interface BackupStorage {
  list(): Promise<string[]>
  read(name: string): Promise<string>
  write(name: string, text: string): Promise<void>
  remove(name: string): Promise<void>
}

/** Backups, newest first */
export async function listBackups(
  storage: BackupStorage,
): Promise<BackupInfo[]> {
  return (await storage.list())
    .map(parseBackupName)
    .filter((info): info is BackupInfo => !!info)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Whether today's automatic backup is still to do */
export function isBackupDue(backups: BackupInfo[], now: Date): boolean {
  const lastAuto = backups.find(({ reason }) => reason === 'auto')
  return (
    !lastAuto ||
    now.getTime() - new Date(lastAuto.createdAt).getTime() >=
      AUTO_BACKUP_INTERVAL_MS
  )
}

export async function createBackup(
  storage: BackupStorage,
  data: Database,
  reason: BackupReason,
  { now = new Date(), max = maxBackups() }: { now?: Date; max?: number } = {},
): Promise<BackupInfo> {
  const name = backupName(now, reason, data.books.length)
  const text = JSON.stringify(data)
  // Out of space (browser storage is small): drop the oldest and try again
  for (;;) {
    try {
      await storage.write(name, text)
      break
    } catch (error) {
      const oldest = (await listBackups(storage)).at(-1)
      if (!oldest) throw error
      await storage.remove(oldest.name)
    }
  }

  // Keep the newest; drop the rest
  const backups = await listBackups(storage)
  await Promise.all(
    backups.slice(max).map(({ name: old }) => storage.remove(old)),
  )

  return parseBackupName(name)!
}

export async function readBackup(
  storage: BackupStorage,
  name: string,
): Promise<Database> {
  const data: unknown = JSON.parse(await storage.read(name))
  if (!isLibraryData(data)) throw new Error('This backup can’t be read')
  return data
}

// ─── Storage per platform ────────────────────────────────────────────────────

/** The folder that holds `filePath` (either kind of path separator) */
export function parentDir(filePath: string) {
  const cut = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'))
  return cut === -1 ? '.' : filePath.slice(0, cut)
}

export function joinPath(dir: string, name: string) {
  const separator = dir.includes('\\') && !dir.includes('/') ? '\\' : '/'
  return `${dir.replace(/[\\/]$/, '')}${separator}${name}`
}

/** Desktop: a `backups` folder next to the library file */
export function electronBackupStorage(libraryPath: string): BackupStorage {
  const api = window.electronAPI
  const dir = joinPath(parentDir(libraryPath), 'backups')
  return {
    list: () => api.listDir(dir),
    read: (name) => api.readFile(joinPath(dir, name)),
    write: async (name, text) => {
      await api.ensureDir(dir)
      await api.writeFile(joinPath(dir, name), text)
    },
    remove: (name) => api.deleteFile(joinPath(dir, name)),
  }
}

/** Android: a `backups` folder in the app's private storage */
export function capacitorBackupStorage(): BackupStorage {
  const load = () => import('@capacitor/filesystem')
  const DIR = 'backups'
  return {
    list: async () => {
      const { Filesystem, Directory } = await load()
      try {
        const { files } = await Filesystem.readdir({
          path: DIR,
          directory: Directory.Data,
        })
        return files.map((file) => file.name)
      } catch {
        // No backups folder yet
        return []
      }
    },
    read: async (name) => {
      const { Filesystem, Directory, Encoding } = await load()
      const { data } = await Filesystem.readFile({
        path: `${DIR}/${name}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
      return typeof data === 'string' ? data : ''
    },
    write: async (name, text) => {
      const { Filesystem, Directory, Encoding } = await load()
      await Filesystem.writeFile({
        path: `${DIR}/${name}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        data: text,
        recursive: true,
      })
    },
    remove: async (name) => {
      const { Filesystem, Directory } = await load()
      await Filesystem.deleteFile({
        path: `${DIR}/${name}`,
        directory: Directory.Data,
      })
    },
  }
}

/** Web demo: browser storage, under one key per backup */
export function localBackupStorage(
  store: Storage = localStorage,
): BackupStorage {
  const KEY = 'booklib.backup:'
  return {
    list: async () =>
      Object.keys(store)
        .filter((key) => key.startsWith(KEY))
        .map((key) => key.slice(KEY.length)),
    read: async (name) => {
      const text = store.getItem(KEY + name)
      if (text === null) throw new Error('Backup not found')
      return text
    },
    write: async (name, text) => store.setItem(KEY + name, text),
    remove: async (name) => store.removeItem(KEY + name),
  }
}
