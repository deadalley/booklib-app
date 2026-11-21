import { useBookLibService } from '~/services/data-management'
import { syncFolder, type SyncFiles } from '~/services/sync/folder-sync'

/*
 * Folder sync for the desktop app. The folder is this device's choice (each
 * computer has its own path to Dropbox and the like), so it's kept in local
 * storage, not in the library.
 */

const SETTINGS_KEY = 'booklib.sync'

type SyncSettings = { folder: string | null; lastSyncedAt: string | null }

function readSettings(): SyncSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}')
    return {
      folder: saved.folder ?? null,
      lastSyncedAt: saved.lastSyncedAt ?? null,
    }
  } catch {
    return { folder: null, lastSyncedAt: null }
  }
}

const settings = ref<SyncSettings>({ folder: null, lastSyncedAt: null })
const status = ref<'idle' | 'syncing' | 'error'>('idle')
const error = ref<string | null>(null)
// Records the last sync brought in from other devices, for a notice
const pulled = ref(0)
// Bumped to show changes from other devices (remounts the page)
const refreshKey = ref(0)
let loaded = false
let running: Promise<void> | null = null
let again = false

function save() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
  } catch {
    // Storage unavailable: sync still works until the app closes
  }
}

const electronFiles: SyncFiles = {
  read: async (path) =>
    (await window.electronAPI.fileExists(path))
      ? await window.electronAPI.readFile(path)
      : null,
  write: (path, text) => window.electronAPI.writeFile(path, text),
}

export function useFolderSync() {
  if (!loaded && typeof window !== 'undefined') {
    settings.value = readSettings()
    loaded = true
  }

  const supported = getAppPlatform() === 'electron'
  const service = useBookLibService()
  const { backUp } = useBackups()

  async function run(first: boolean) {
    const folder = settings.value.folder
    if (!supported || !folder) return
    status.value = 'syncing'
    try {
      const result = await syncFolder(
        folder,
        {
          files: electronFiles,
          exportLibrary: () => service.exportLibrary(),
          applySyncedLibrary: (data) => service.applySyncedLibrary(data),
          backUp,
        },
        { first },
      )
      settings.value = {
        ...settings.value,
        lastSyncedAt: new Date().toISOString(),
      }
      save()
      error.value = null
      status.value = 'idle'
      if (result.pulled) pulled.value += result.pulled
    } catch (caught) {
      error.value =
        caught instanceof Error
          ? caught.message
          : 'Sync failed for an unknown reason.'
      status.value = 'error'
    }
  }

  /** Syncs once at a time; a request while running syncs again after */
  function sync({ first = false } = {}) {
    if (running) {
      again = true
      return running
    }
    running = run(first).finally(() => {
      running = null
      if (again) {
        again = false
        sync()
      }
    })
    return running
  }

  async function chooseFolder() {
    const folder = await window.electronAPI.pickFolder()
    if (!folder) return
    settings.value = { folder, lastSyncedAt: null }
    save()
    await sync({ first: true })
  }

  function stopSyncing() {
    settings.value = { folder: null, lastSyncedAt: null }
    error.value = null
    status.value = 'idle'
    save()
  }

  /** Shows what came from other devices */
  function showChanges() {
    pulled.value = 0
    refreshKey.value++
  }

  return {
    supported,
    folder: computed(() => settings.value.folder),
    lastSyncedAt: computed(() => settings.value.lastSyncedAt),
    status: readonly(status),
    error: readonly(error),
    pulled,
    refreshKey: readonly(refreshKey),
    sync,
    chooseFolder,
    stopSyncing,
    showChanges,
  }
}
