import type { Database } from '~/types/api'
import type { BackupReason } from '../backups'
import { joinPath } from '../backups'
import { isLibraryData } from '../data-management'
import { mergeLibraries } from './merge'

/*
 * Sync through a folder the user picks, e.g. inside Dropbox, iCloud Drive or
 * Syncthing: that service moves the file between devices; BookLib merges it
 * with this device's library and writes the result back. No account.
 */

export const SYNC_FILE_NAME = 'booklib-library.json'

export type SyncFiles = {
  // null when there's no file yet
  read(path: string): Promise<string | null>
  write(path: string, text: string): Promise<void>
}

export type SyncDeps = {
  files: SyncFiles
  exportLibrary(): Promise<Database>
  applySyncedLibrary(data: Database): Promise<void>
  backUp(reason: BackupReason): Promise<unknown>
}

export type SyncResult = {
  // Records this device got from the other copy
  pulled: number
  // Whether the folder's file was written
  pushed: boolean
}

/** The sync file couldn't be read: left alone rather than overwritten */
export class SyncFileError extends Error {
  constructor() {
    super(
      'The library file in the sync folder can’t be read. It may still be copying from another device; BookLib tries again shortly.',
    )
    this.name = 'SyncFileError'
  }
}

export async function syncFolder(
  folder: string,
  deps: SyncDeps,
  { first = false }: { first?: boolean } = {},
): Promise<SyncResult> {
  const path = joinPath(folder, SYNC_FILE_NAME)
  const text = await deps.files.read(path)

  let remote: Database | null = null
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text)
      if (!isLibraryData(parsed)) throw new SyncFileError()
      remote = parsed
    } catch {
      throw new SyncFileError()
    }
  }

  const local = structuredClone(await deps.exportLibrary())
  // The first sync with an existing file changes this library the most
  if (first && remote) await deps.backUp('before-sync')

  // Without a folder file yet, merging with itself gives the same canonical
  // shape, so later syncs can tell "unchanged" by comparing text
  const { merged, summary } = mergeLibraries(local, remote ?? local)

  const mergedText = JSON.stringify(merged)
  if (mergedText !== JSON.stringify(local)) {
    await deps.applySyncedLibrary(merged)
  }

  const pushed = !remote || mergedText !== JSON.stringify(remote)
  if (pushed) await deps.files.write(path, mergedText)

  return { pulled: summary.changed, pushed }
}
