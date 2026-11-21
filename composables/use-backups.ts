import { useBookLibService } from '~/services/data-management'
import {
  capacitorBackupStorage,
  createBackup,
  electronBackupStorage,
  isBackupDue,
  listBackups,
  localBackupStorage,
  readBackup,
  type BackupInfo,
  type BackupReason,
  type BackupStorage,
} from '~/services/backups'

// Shared: one list for the whole app
const backups = ref<BackupInfo[]>([])
let storagePromise: Promise<BackupStorage> | null = null

async function getStorage(): Promise<BackupStorage> {
  storagePromise ??= (async () => {
    switch (getAppPlatform()) {
      case 'electron':
        return electronBackupStorage(await useBookLibService().getLibraryPath())
      case 'android':
        return capacitorBackupStorage()
      default:
        return localBackupStorage()
    }
  })()
  return storagePromise
}

/** Local backups of the library, with version history */
export function useBackups() {
  const service = useBookLibService()

  async function refresh() {
    backups.value = await listBackups(await getStorage())
  }

  async function backUp(reason: BackupReason = 'manual') {
    const data = await service.exportLibrary()
    const info = await createBackup(await getStorage(), data, reason)
    await refresh()
    return info
  }

  /** The daily backup, if it's due and there's anything to keep */
  async function backUpIfDue() {
    await refresh()
    const data = await service.exportLibrary()
    if (!data.books.length || !isBackupDue(backups.value, new Date())) return
    await backUp('auto')
  }

  /** Replaces the library with a backup, keeping a copy of it first */
  async function restore(name: string) {
    const data = await readBackup(await getStorage(), name)
    await backUp('before-restore')
    await service.replaceLibrary(data)
    await refresh()
  }

  async function download(name: string) {
    const storage = await getStorage()
    downloadFile(name, await storage.read(name), 'application/json')
  }

  return {
    backups: readonly(backups),
    refresh,
    backUp,
    backUpIfDue,
    restore,
    download,
  }
}
